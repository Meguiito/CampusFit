from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import bcrypt
import os
import magic
from datetime import datetime, timedelta
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from apscheduler.schedulers.background import BackgroundScheduler
import atexit


app = Flask(__name__)

# Configuración de CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Ajusta según tu frontend

# Configuración de MongoDB
app.config['MONGO_URI'] = 'mongodb+srv://Vicente:ap4STCRZXhetOIjA@campusfit.xih68.mongodb.net/CampusFIT_DB?retryWrites=true&w=majority'
mongo = PyMongo(app)

# Inicializa el scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Asegúrate de cerrar el scheduler al finalizar la aplicación
atexit.register(lambda: scheduler.shutdown())

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'franciscobenavides'  # Cambia esto por una clave más segura en producción
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expira en 1 hora

jwt = JWTManager(app)

# Ruta para crear usuarios
@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data.get("username")
        rut = data.get("rut")
        password = data.get("password")
        email = data.get("email")

        # Validación de campos
        if not all([username, rut, password, email]):
            return jsonify({"error": "Todos los campos son requeridos"}), 400

        # Verificar si el RUT ya está registrado
        existing_user_rut = mongo.db.Usuarios.find_one({"rut": rut})
        if existing_user_rut:
            return jsonify({"error": "El RUT ya está registrado"}), 400

        # Verificar si el correo ya está registrado
        existing_user_email = mongo.db.Usuarios.find_one({"email": email})
        if existing_user_email:
            return jsonify({"error": "El correo institucional ya está registrado"}), 400

        # Hashear la contraseña
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        # Insertar el nuevo usuario en la base de datos
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
@jwt_required()
def delete_user(username):
    try:
        # Opcional: Verificar si el usuario que hace la solicitud es un administrador
        identity = get_jwt_identity()
        if identity.get('tipo_de_usuario') != 'admin':
            return jsonify({"error": "Permiso denegado"}), 403

        result = mongo.db.Usuarios.delete_one({'username': username})

        if result.deleted_count > 0:
            return jsonify({"message": f"Usuario {username} eliminado correctamente"}), 200
        else:
            return jsonify({"error": f"Usuario {username} no encontrado"}), 404
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

# Ruta para verificar usuarios y generar token
@app.route('/users/verify', methods=['POST'])
def verify_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        # Validación de campos
        if not all([email, password]):
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        # Buscar en la colección de Usuarios
        user = mongo.db.Usuarios.find_one({'email': email})

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            tipo_usuario = "client"
        else:
            # Si no está en Usuarios, buscar en la colección de Administradores
            user = mongo.db.Admin.find_one({'email': email})
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                tipo_usuario = "admin"
            else:
                return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

        # Obtener los datos del usuario
        rut = user.get('rut')
        username = user.get('username')
        email = user.get('email')

        # Generar el token JWT
        access_token = create_access_token(identity={
            'rut': rut,
            'username': username,
            'email': email,
            'tipo_de_usuario': tipo_usuario
        })

        return jsonify({
            "message": "Verificación exitosa",
            "access_token": access_token,
            "user": {
                "rut": rut,
                "username": username,
                "email": email,
                "tipo_de_usuario": tipo_usuario
            }
        }), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

# Ruta protegida para obtener datos del perfil
@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        # Obtener la identidad del token JWT
        identity = get_jwt_identity()
        email = identity.get('email')

        # Buscar el usuario en la colección de Usuarios
        user = mongo.db.Usuarios.find_one({'email': email})
        if user:
            tipo_usuario = "client"
        else:
            # Si no está en Usuarios, buscar en Admin
            user = mongo.db.Admin.find_one({'email': email})
            if user:
                tipo_usuario = "admin"
            else:
                return jsonify({"error": "Usuario no encontrado"}), 404

        # Preparar la respuesta con los datos del usuario
        response = {
            'rut': user.get('rut'),
            'username': user.get('username'),
            'email': user.get('email'),
            'tipo_de_usuario': tipo_usuario
        }
        return jsonify(response), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

@app.route('/api/equipo_and_canchas', methods=['POST'])
@jwt_required()
def obtener_equipos_y_canchas_disponibles():
    try:
        data = request.get_json()
        fecha = data.get("fecha")
        hora = data.get("hora")

        # Filtrar reservas existentes para la fecha y hora exactas seleccionadas
        reservas_existentes = mongo.db.Reservas.find({
            "fecha": fecha,
            "hora": hora
        })

        reservas_especiales_existentes = mongo.db.Reservas_especiales.find({
            "fecha": fecha,
            "hora": hora
        })

        # Convertir las reservas a una lista para facilitar la comprobación
        equipos_reservados = []
        canchas_reservadas = []

        for reserva in reservas_existentes:
            canchas_reservadas.append(reserva.get("cancha"))
            equipos_reservados.append(reserva.get("equipo"))

        for reserva_especial in reservas_especiales_existentes:
            canchas_reservadas.append(reserva_especial.get("cancha"))
            equipos_reservados.append(reserva_especial.get("equipo"))

        # Obtener todas las canchas y equipos
        canchas = mongo.db.Espacios.find()
        equipos = mongo.db.Equipo.find()  

        # Filtrar las canchas y equipos no reservados en la fecha y hora específicas
        canchas_disponibles = []
        for cancha in canchas:
            if cancha.get("nombre") not in canchas_reservadas:
                # Convertir ObjectId a string y asegurarse de incluir el tipo
                cancha['_id'] = str(cancha['_id'])
                canchas_disponibles.append(cancha)

        equipos_disponibles = []
        for equipo in equipos:
            if equipo.get("nombre") not in equipos_reservados:
                # Convertir ObjectId a string y asegurarse de incluir el tipo
                equipo['_id'] = str(equipo['_id'])
                equipos_disponibles.append(equipo)

        return jsonify({
            "canchas_disponibles": canchas_disponibles,
            "equipos_disponibles": equipos_disponibles
        }), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

@app.route('/api/reservas', methods=['GET'])
@jwt_required()
def obtener_reservas():
    try:
        usuario_actual = get_jwt_identity()['email']  # Asegúrate de acceder correctamente al email
        reservas_usuario = mongo.db.Reservas.find({"email_usuario": usuario_actual})
        reservas = []
        for reserva in reservas_usuario:
            reserva['_id'] = str(reserva['_id'])  # Convertir ObjectId a string
            reservas.append(reserva)

        return jsonify({"reservas": reservas}), 200
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500




# Ruta para manejar solicitudes de reserva especial
@app.route('/special_request', methods=['POST'])
@jwt_required()
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

        # Obtener la identidad del usuario que realiza la solicitud
        identity = get_jwt_identity()

        # Almacenar la información de la reserva en la base de datos
        reserva_data = {
            "filename": file.filename,
            "filepath": filepath,
            "upload_date": datetime.utcnow(),
            "user_email": identity.get('email')  # Asociar con el usuario
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

@app.route('/api/reservas', methods=['POST'])
@jwt_required()
def crear_reserva():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        data = request.get_json()
        fecha = data.get("fecha")
        hora = data.get("hora")
        cancha = data.get("cancha")
        equipo = data.get("equipo")

        if not all([fecha, hora, cancha, equipo]):
            return jsonify({"error": "Se requieren fecha, hora, cancha y equipo"}), 400

        reserva_mismo_dia = mongo.db.Reservas.find_one({
            "fecha": fecha,
            "email_usuario": email
        })

        reserva_especial_mismo_dia = mongo.db.Reservas_especiales.find_one({
            "fecha": fecha,
            "email_usuario": email
        })

        total_reservas = mongo.db.Reservas.count_documents({"email_usuario": email}) + \
                         mongo.db.Reservas_especiales.count_documents({"email_usuario": email})

        if total_reservas >= 2:
            return jsonify({"error": "Has alcanzado el límite de 2 reservas semanales."}), 409

        if reserva_mismo_dia or reserva_especial_mismo_dia:
            return jsonify({"error": "Ya tienes una reserva en este día."}), 409

        conflicto_reserva = mongo.db.Reservas.find_one({
            "fecha": fecha,
            "hora": hora,
            "cancha": cancha
        })
        
        conflicto_reserva_especial = mongo.db.Reservas_especiales.find_one({
            "fecha": fecha,
            "hora": hora,
            "cancha": cancha
        })

        if conflicto_reserva or conflicto_reserva_especial:
            return jsonify({"error": "El horario seleccionado ya está reservado."}), 409

        # 4. Crear objeto de reserva incluyendo el correo del usuario
        reserva = {
            "fecha": fecha,
            "hora": hora,
            "cancha": cancha,
            "equipo": equipo,
            "email_usuario": email  # Almacena el correo del usuario autenticado
        }

        # Insertar reserva en la colección Reservas
        mongo.db.Reservas.insert_one(reserva)
        return jsonify({"message": "Reserva guardada con éxito"}), 201

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


def eliminar_reservas_antiguas():
    try:
        fecha_actual = datetime.now().strftime('%Y-%m-%d')
        
        resultado_reservas = mongo.db.Reservas.delete_many({
            "fecha": {"$lt": fecha_actual}
        })
        print(f"Reservas eliminadas de Reservas: {resultado_reservas.deleted_count}")
        

        resultado_reservas_especiales = mongo.db.Reservas_especiales.delete_many({
            "fecha": {"$lt": fecha_actual}
        })
        print(f"Reservas eliminadas de Reservas_especiales: {resultado_reservas_especiales.deleted_count}")
        
    except PyMongoError as e:
        print(f"Error en la base de datos al eliminar reservas antiguas: {str(e)}")
    except Exception as e:
        print(f"Error inesperado al eliminar reservas antiguas: {str(e)}")

scheduler.add_job(
    func=eliminar_reservas_antiguas,
    trigger='cron',
    day_of_week='mon',
    hour=2,
    minute=0,
    id='eliminar_reservas_antiguas',
    replace_existing=True
)
    
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except ServerSelectionTimeoutError as e:
        print(f"Error de conexión a MongoDB: {e}")
















