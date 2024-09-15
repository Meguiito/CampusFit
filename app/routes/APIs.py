from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import bcrypt
import os
import magic
from datetime import datetime 
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from flask_jwt_extended import JWTManager, create_access_token
from pymongo.errors import PyMongoError
import bcrypt
from datetime import timedelta

app = Flask(__name__)
CORS(app)
app.config['MONGO_URI'] = 'mongodb+srv://Vicente:ap4STCRZXhetOIjA@campusfit.xih68.mongodb.net/CampusFIT_DB?retryWrites=true&w=majority'

mongo = PyMongo(app)

# Ruta para crear usuarios
@app.route('/users', methods=['POST'])
def create_user():
    try:
        username = request.json.get("username")
        rut = request.json.get("rut")
        password = request.json.get("password")
        email = request.json.get("email")

        existing_user_rut = mongo.db.Usuarios.find_one({"rut": rut})
        if existing_user_rut:
            return jsonify({"error": "El RUT ya está registrado"}), 400

        existing_user_email = mongo.db.Usuarios.find_one({"email": email})
        if existing_user_email:
            return jsonify({"error": "El correo institucional ya está registrado"}), 400

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        result = mongo.db.Usuarios.insert_one(
            {'rut': rut, 'username': username, 'password': hashed_password.decode('utf-8'), 'email': email}
        )

        response = {
            'id': str(result.inserted_id),
            'rut': rut,
            'username': username,
            'email': email
        }
        return jsonify(response), 201 

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


# Ruta para eliminar usuarios
@app.route('/users/<username>', methods=['DELETE'])
def delete_user(username):
    try:
        result = mongo.db.Usuarios.delete_one({'username': username})

        if result.deleted_count > 0:
            return jsonify({"message": f"Usuario {username} eliminado correctamente"}), 200
        else:
            return jsonify({"error": f"Usuario {username} no encontrado"}), 404
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



app.config['JWT_SECRET_KEY'] = 'franciscobenavides'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Opcional: Token expira en 1 hora

jwt = JWTManager(app)

# Ruta para verificar usuarios y generar token
@app.route('/users/verify', methods=['POST'])
def verify_user():
    try:
        email = request.json.get("email")
        password = request.json.get("password")

        user = mongo.db.Usuarios.find_one({'email': email})
        

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            # Obtén los datos del usuario en el orden requerido
            rut = user.get('rut')  # RUT del usuario
            username = user.get('username')  # Nombre de usuario
            email = user.get('email')  # Correo electrónico

            # Genera el token JWT con los datos requeridos
            access_token = create_access_token(identity={'rut': rut, 'username': username, 'email': email})
            
            return jsonify({
                "message": "Verificación exitosa",
                "access_token": access_token,
                "user": {
                    "rut": rut,
                    "username": username,
                    "email": email
                }
            }), 200
        else:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)


# Ruta para manejar solicitudes de reserva especial
@app.route('/special_request', methods=['POST'])
def handle_special_request():
    try:
        # Verificar si hay un archivo en la solicitud
        if 'file' not in request.files:
            return jsonify({"error": "No se encontró el archivo en la solicitud"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400

        # Verificar si el directorio 'uploads' existe, y si no, crearlo
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # Verificar que el archivo sea un PDF
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)  # Vuelve al principio del archivo después de leer su contenido

        if mime_type != 'application/pdf':
            return jsonify({"error": "El archivo no es un PDF válido"}), 400

        # Guardar el archivo en la carpeta 'uploads'
        filepath = os.path.join(upload_folder, file.filename)
        file.save(filepath)

        # Almacenar la información de la reserva en la base de datos
        reserva_data = {
            "filename": file.filename,
            "filepath": filepath,
            "upload_date": datetime.utcnow(),
        }

        result = mongo.db.Reservas_especiales.insert_one(reserva_data)

        return jsonify({
            "message": "PDF subido exitosamente",
            "file_path": filepath,
            "mongo_id": str(result.inserted_id)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


# Manejadores de errores
@app.errorhandler(404)
def not_found(error=None):
    message = {
        'message': 'Recurso no encontrado: ' + request.url,
        'status': 404
    }
    return jsonify(message), 404

@app.errorhandler(500)
def server_error(error=None):
    message = {
        'message': 'Error interno del servidor',
        'status': 500
    }
    return jsonify(message), 500

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except ServerSelectionTimeoutError as e:
        print(f"Error de conexión a MongoDB: {e}")





