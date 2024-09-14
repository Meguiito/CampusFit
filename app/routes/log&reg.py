from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import bcrypt
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

app = Flask(__name__)
CORS(app)
app.config['MONGO_URI'] = 'mongodb+srv://Vicente:ap4STCRZXhetOIjA@campusfit.xih68.mongodb.net/CampusFIT_DB?retryWrites=true&w=majority'

mongo = PyMongo(app)

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

@app.route('/users/verify', methods=['POST'])
def verify_user():
    try:
        email = request.json.get("email")
        password = request.json.get("password")

        user = mongo.db.Usuarios.find_one({'email': email})
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"message": "Verificación exitosa"}), 200
        else:
            return jsonify({"error": "Usuario o contraseña incorrectos"}), 401
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

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