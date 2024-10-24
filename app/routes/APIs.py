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

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}) 

app.config['MONGO_URI'] = 'mongodb+srv://Vicente:ap4STCRZXhetOIjA@campusfit.xih68.mongodb.net/CampusFIT_DB?retryWrites=true&w=majority'
mongo = PyMongo(app)

scheduler = BackgroundScheduler()
scheduler.start()

atexit.register(lambda: scheduler.shutdown())

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'franciscobenavides'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  

jwt = JWTManager(app)





@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data.get("username")
        rut = data.get("rut")
        password = data.get("password")
        email = data.get("email")

        existing_user_rut = mongo.db.Usuarios.find_one({"rut": rut})
        existing_user_email = mongo.db.Usuarios.find_one({"email": email})

        if existing_user_rut and existing_user_email:
            return jsonify({
                "error_rut": "El RUT ya está registrado", 
                "error_email": "El correo institucional ya está registrado"
            }), 403
        
        elif existing_user_rut:
            return jsonify({"error": "El RUT ya está registrado"}), 401

        elif existing_user_email:
            return jsonify({"error": "El correo institucional ya está registrado"}), 402


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





@app.route('/users/verify', methods=['POST'])
def verify_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = mongo.db.Usuarios.find_one({'email': email})

        if user:
            # Verifica la contraseña
            if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                tipo_usuario = "client"
                isAdmin = False  # Este usuario no es admin
            else:
                return jsonify({"error": "Contraseña incorrecta"}), 401
        else:
            # Si no se encontró en Usuarios, verifica en Admin
            user = mongo.db.Admin.find_one({'email': email})
            if user:
                if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    tipo_usuario = "admin"
                    isAdmin = True  # Este usuario es admin
                else:
                    return jsonify({"error": "Contraseña incorrecta"}), 401
            else:
                return jsonify({"error": "Correo no registrado"}), 402

        rut = user.get('rut')
        username = user.get('username')
        email = user.get('email')

        access_token = create_access_token(identity={
            'rut': rut,
            'username': username,
            'email': email,
            'tipo_de_usuario': tipo_usuario
        })

        return jsonify({
            "message": "Verificación exitosa",
            "access_token": access_token,
            "isAdmin": isAdmin,  # Agregar este campo
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




@app.route('/users/<username>', methods=['DELETE'])
@jwt_required()
def delete_user(username):
    try:
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




@app.route('/api/canchas_equipo', methods=['GET'])  # Cambia a GET
@jwt_required()
def obtener_canchas():
    try:
        # Obtener todas las canchas
        canchas = mongo.db.Espacios.find()

        canchas_disponibles = []

        # Procesar canchas
        for cancha in canchas:
            cancha['_id'] = str(cancha['_id'])  # Convertir ObjectId a string
            canchas_disponibles.append(cancha)

        equipos = mongo.db.Equipo.find()

        equipos_disponibles = []

        for equipo in equipos:
            equipo['_id'] = str(equipo['_id'])  # Convertir ObjectId a string
            equipos_disponibles.append(equipo)

        return jsonify({
            "canchas_disponibles": canchas_disponibles,
            "equipos_disponibles": equipos_disponibles
        }), 200

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

        reservas_existentes = mongo.db.Reservas.find({
            "fecha": fecha,
            "hora": hora
        })

        reservas_especiales_existentes = mongo.db.Reservas_especiales.find({
            "fecha": fecha,
            "hora": hora
        })

        equipos_reservados = []
        canchas_reservadas = []

        for reserva in reservas_existentes:
            canchas_reservadas.append(reserva.get("cancha"))
            equipos_reservados.append(reserva.get("equipo"))

        for reserva_especial in reservas_especiales_existentes:
            canchas_reservadas.append(reserva_especial.get("cancha"))
            equipos_reservados.append(reserva_especial.get("equipo"))

        canchas = mongo.db.Espacios.find()
        equipos = mongo.db.Equipo.find()  

        canchas_disponibles = []
        for cancha in canchas:
            if cancha.get("nombre") not in canchas_reservadas:
                cancha['_id'] = str(cancha['_id'])
                canchas_disponibles.append(cancha)

        equipos_disponibles = []
        for equipo in equipos:
            if equipo.get("nombre") not in equipos_reservados:
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
        usuario_actual = get_jwt_identity()['email'] 
        reservas_usuario = mongo.db.Reservas.find({"email_usuario": usuario_actual})
        reservas = []
        for reserva in reservas_usuario:
            reserva['_id'] = str(reserva['_id'])  
            reservas.append(reserva)

        return jsonify({"reservas": reservas}), 200
    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/special_request', methods=['POST'])
@jwt_required()
def handle_special_request():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No se encontró el archivo en la solicitud"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400

        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0) 

        if mime_type != 'application/pdf':
            return jsonify({"error": "El archivo no es un PDF válido"}), 400

        filepath = os.path.join(upload_folder, file.filename)
        file.save(filepath)

        identity = get_jwt_identity()

        reserva_data = {
            "filename": file.filename,
            "filepath": filepath,
            "upload_date": datetime.utcnow(),
            "user_email": identity.get('email') 
        }

        result = mongo.db.Reservas_especiales.insert_one(reserva_data)

        return jsonify({
            "message": "PDF subido exitosamente",
            "file_path": filepath,
            "mongo_id": str(result.inserted_id)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






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

        reserva = {
            "fecha": fecha,
            "hora": hora,
            "cancha": cancha,
            "equipo": equipo,
            "email_usuario": email  
        }

        mongo.db.Reservas.insert_one(reserva)
        return jsonify({"message": "Reserva guardada con éxito"}), 201

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/api/verificar_reservas', methods=['POST'])
@jwt_required()
def verificar_reservas():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        data = request.get_json()
        
        if 'fecha' not in data:
            return jsonify({"error": "Falta el campo 'fecha'."}), 400
        
        fecha = data['fecha']

        reserva_mismo_dia = mongo.db.Reservas.find_one({
            "fecha": fecha,
            "email_usuario": email
        })

        total_reservas = mongo.db.Reservas.count_documents({"email_usuario": email})

        if total_reservas >= 2:
            return jsonify({"error": "Has alcanzado el límite de 2 reservas."}), 410

        if reserva_mismo_dia:
            return jsonify({"error": "Ya tienes una reserva en este día."}), 409
        
        return jsonify({"message": "Reserva disponible."}), 200

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


@app.route('/api/usuarios', methods=['GET'])
@jwt_required()
def get_usuarios():
    try:
        # Obtener la identidad del token JWT
        identity = get_jwt_identity()
        email = identity.get('email')

        # Verificar si el usuario es admin
        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        # Obtener todos los usuarios
        usuarios = mongo.db.Usuarios.find({}, {"_id": 0, "username": 1, "email": 1, "rut": 1})
        usuarios_list = list(usuarios)  # Convertir a lista para JSON

        return jsonify(usuarios_list), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


scheduler.add_job(
    func=eliminar_reservas_antiguas,
    trigger='cron',
    day_of_week='mon',
    hour=2,
    minute=0,
    id='eliminar_reservas_antiguas',
    replace_existing=True
)




@app.route('/reservas-dia', methods=['GET'])
@jwt_required()
def obtener_reservas_del_dia():
    try:
        # Obtener la fecha actual (sin uso de pytz)
        fecha_actual = datetime.now().strftime('%Y-%m-%d')

        # Filtrar reservas del día actual
        reservas = list(mongo.db.Reservas.find({
            "fecha": fecha_actual
        }).sort("hora", 1))  # Ordenar por hora ascendente

        # Si no hay reservas
        if not reservas:
            return jsonify({"message": "No hay reservas para el día de hoy."}), 200

        # Filtrar los campos que queremos devolver
        reservas_filtradas = [{
            "cancha": reserva.get("cancha"),
            "equipo": reserva.get("equipo"),
            "email_usuario": reserva.get("email_usuario")
        } for reserva in reservas]

        return jsonify(reservas_filtradas), 200

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
















