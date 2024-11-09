from flask import Flask, request, jsonify, send_file
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
import json
from bson import ObjectId
from gridfs import GridFS
import pytz

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}) 

app.config['MONGO_URI'] = 'mongodb+srv://Vicente:ap4STCRZXhetOIjA@campusfit.xih68.mongodb.net/CampusFIT_DB?retryWrites=true&w=majority'
mongo = PyMongo(app)
fs = GridFS(mongo.db)
scheduler = BackgroundScheduler()
scheduler.start()

atexit.register(lambda: scheduler.shutdown())

# Configuración de JWT
app.config['JWT_SECRET_KEY'] = 'franciscobenavides'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  

jwt = JWTManager(app)

chile_timezone = pytz.timezone("America/Santiago")





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
            if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                tipo_usuario = "client"
                isAdmin = False  
            else:
                return jsonify({"error": "Contraseña incorrecta"}), 401
        else:
            user = mongo.db.Admin.find_one({'email': email})
            if user:
                if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                    tipo_usuario = "admin"
                    isAdmin = True  
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
            "isAdmin": isAdmin,  
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
        identity = get_jwt_identity()
        email = identity.get('email')

        user = mongo.db.Usuarios.find_one({'email': email})
        if user:
            tipo_usuario = "client"
        else:
            user = mongo.db.Admin.find_one({'email': email})
            if user:
                tipo_usuario = "admin"
            else:
                return jsonify({"error": "Usuario no encontrado"}), 404

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




@app.route('/api/canchas_equipo', methods=['GET'])  
@jwt_required()
def obtener_canchas():
    try:
        canchas = mongo.db.Espacios.find()

        canchas_disponibles = []

        for cancha in canchas:
            cancha['_id'] = str(cancha['_id'])  
            canchas_disponibles.append(cancha)

        equipos = mongo.db.Equipo.find()

        equipos_disponibles = []

        for equipo in equipos:
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





@app.route('/api/equipo_and_canchas', methods=['POST'])
@jwt_required()
def obtener_equipos_y_canchas_disponibles():
    try:
        data = request.get_json()
        fecha = data.get("fecha")
        hora = data.get("hora")

        canchas_reservadas = []
        equipos_reservados = []
        horas_no_disponibles = set()

        if fecha and not hora:
            reservas_existentes = mongo.db.Reservas.find({"fecha": fecha})

            total_canchas = mongo.db.Espacios.count_documents({})

            reservas_por_hora = {}
            for reserva in reservas_existentes:
                hora_reserva = reserva.get("hora")
                if hora_reserva not in reservas_por_hora:
                    reservas_por_hora[hora_reserva] = 0
                reservas_por_hora[hora_reserva] += 1
            
            for hora_reserva, cantidad_reservas in reservas_por_hora.items():
                if cantidad_reservas >= total_canchas:
                    horas_no_disponibles.add(hora_reserva)
            
            return jsonify({
                "horas_no_disponibles": list(horas_no_disponibles)
            }), 200

        elif fecha and hora:
            reservas_existentes = mongo.db.Reservas.find({"fecha": fecha, "hora": hora})

            for reserva in reservas_existentes:
                canchas_reservadas.append(reserva.get("cancha"))
                equipos_reservados.append(reserva.get("equipo"))

        return jsonify({
            "canchas_reservadas": canchas_reservadas,
            "equipos_reservados": equipos_reservados,
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
            return jsonify({"error": "No se seleccionó ningún archivo PDF"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No se encontró el archivo PDF en la solicitud"}), 400

        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)
        if mime_type != 'application/pdf':
            return jsonify({"error": "El archivo no es un PDF válido"}), 400

        file_id = fs.put(file, filename=file.filename, content_type="application/pdf")

        identity = get_jwt_identity()
        meses = request.form.get('meses')
        dias = request.form.get('dias')
        dia_esp = request.form.get('dia_esp')

        upload_date = datetime.now(chile_timezone)
        formatted_upload_date = upload_date.strftime("%A %d de %B a las %H:%M")

        formatted_upload_date = formatted_upload_date.replace("Monday", "Lunes").replace("Tuesday", "Martes")\
                                                     .replace("Wednesday", "Miércoles").replace("Thursday", "Jueves")\
                                                     .replace("Friday", "Viernes").replace("Saturday", "Sábado")\
                                                     .replace("Sunday", "Domingo").replace("January", "enero")\
                                                     .replace("February", "febrero").replace("March", "marzo")\
                                                     .replace("April", "abril").replace("May", "mayo")\
                                                     .replace("June", "junio").replace("July", "julio")\
                                                     .replace("August", "agosto").replace("September", "septiembre")\
                                                     .replace("October", "octubre").replace("November", "noviembre")\
                                                     .replace("December", "diciembre")

        reserva_data = {
            "filename": file.filename,
            "file_id": str(file_id),
            "upload_date": formatted_upload_date,  
            "user_email": identity.get('email'),
            "user_name": identity.get('username')
        }

        if meses and dias:
            reserva_data["meses"] = json.loads(meses)
            reserva_data["dias"] = json.loads(dias)
            reserva_data["tipo"] = "DG"
        elif dia_esp:
            reserva_data["dia_esp"] = json.loads(dia_esp)
            reserva_data["tipo"] = "DE"
            
        result = mongo.db.Reservas_especiales.insert_one(reserva_data)

        return jsonify({
            "message": "Reserva especial enviada para su revisión",
            "mongo_id": str(result.inserted_id)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/get_special_requests', methods=['GET'])
@jwt_required()
def get_special_requests():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403


        reservas_especiales = mongo.db.Reservas_especiales.find()

        reservas_list = []
        for reserva in reservas_especiales:
            reserva['_id'] = str(reserva['_id'])  
            reservas_list.append(reserva)

        return jsonify(reservas_list), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/manejar_pdf/<mongo_id>/<action>', methods=['GET'])
@jwt_required()
def manejar_pdf(mongo_id, action):
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        try:
            object_id = ObjectId(mongo_id)
        except Exception:
            return jsonify({"error": "ID de reserva inválido"}), 400

        reserva = mongo.db.Reservas_especiales.find_one({"_id": object_id})
        if not reserva:
            return jsonify({"error": "Reserva especial no encontrada"}), 404

        file_id = reserva.get("file_id")
        if not file_id:
            return jsonify({"error": "No se encontró el ID del archivo PDF"}), 404

        file_data = fs.get(ObjectId(file_id))
        if not file_data:
            return jsonify({"error": "Archivo PDF no encontrado en GridFS"}), 404

        if action == "ver":
            return send_file(file_data, as_attachment=False, download_name=reserva["filename"])

        elif action == "descargar":
            return send_file(file_data, as_attachment=True, download_name=reserva["filename"])

        else:
            return jsonify({"error": "Acción no válida"}), 400

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






@app.route('/api/verificar_reservas_especiales', methods=['POST'])
@jwt_required()
def verificar_reservas_especiales():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')


        total_reservas = mongo.db.Reservas_especiales.count_documents({"user_email": email})

        if total_reservas >= 2:
            return jsonify({"error": "Has alcanzado el límite de 2 reservas especiales por semestre."}), 410
       
        return jsonify({"message": "Reserva disponible."}), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/api/usuarios', methods=['GET'])
@jwt_required()
def get_usuarios():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        usuarios = mongo.db.Usuarios.find({}, {"_id": 0, "username": 1, "email": 1, "rut": 1})
        usuarios_list = list(usuarios)  

        return jsonify(usuarios_list), 200

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/reservas-dia', methods=['GET'])
@jwt_required()
def obtener_reservas_del_dia():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        fecha_actual = datetime.now().strftime('%d-%m-%Y')

        reservas = list(mongo.db.Reservas.find({
            "fecha": fecha_actual
        }).sort("hora", 1)) 

        if not reservas:
            return jsonify({"message": "No hay reservas para el día de hoy."}), 200

        reservas_filtradas = [{
            "cancha": reserva.get("cancha"),
            "equipo": reserva.get("equipo"),
            "email_usuario": reserva.get("email_usuario"),
            "hora": reserva.get("hora")  
        } for reserva in reservas]

        return jsonify(reservas_filtradas), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500
    





@app.route('/admin/reservas-agrupadas', methods=['GET'])
@jwt_required()
def obtener_reservas_agrupadas():
    try:
        reservas = list(mongo.db.Reservas.find())
        reservas_format = [
            {
                "_id": str(reserva["_id"]),
                "fecha": reserva.get("fecha"),
                "hora": reserva.get("hora"),
                "cancha": reserva.get("cancha"),
                "equipo": reserva.get("equipo"),
                "email_usuario": reserva.get("email_usuario")
            }
            for reserva in reservas
        ]
        return jsonify(reservas_format), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener las reservas"}), 500
    



@app.route('/admin/eliminar-reserva', methods=['POST'])
@jwt_required()
def eliminar_reserva():
    # Obtener los datos del cuerpo de la solicitud
    data = request.get_json()
    reserva_id = data.get("reservaId")
    password = data.get("password")
    delete_reason = data.get("deleteReason")
    
    # Obtener el email desde el JWT
    identity = get_jwt_identity()
    email = identity.get("email")

    # Verificar que todos los campos estén presentes
    if not (reserva_id and password and delete_reason):
        return jsonify({"success": False, "message": "Todos los campos son requeridos"}), 400

    # Verificar que el usuario autenticado sea el administrador autorizado
    if email != "admin@uctadmin.cl":
        return jsonify({"success": False, "message": "Acceso no autorizado"}), 403

    # Buscar la cuenta del administrador
    admin_user = mongo.db.Admin.find_one({"email": email})

    # Verificar la contraseña ingresada contra la almacenada
    if not admin_user or not bcrypt.checkpw(password.encode('utf-8'), admin_user["password"]):
        return jsonify({"success": False, "message": "Contraseña incorrecta"}), 403

    # Intentar obtener y eliminar la reserva
    try:
        # Buscar la reserva por ID en la colección "Reservas"
        reserva = mongo.db.Reservas.find_one({"_id": ObjectId(reserva_id)})
        if not reserva:
            return jsonify({"success": False, "message": "Reserva no encontrada"}), 404

        # Guardar el correo del usuario que hizo la reserva
        email_usuario = reserva["email_usuario"]

        # Eliminar la reserva
        mongo.db.Reservas.delete_one({"_id": ObjectId(reserva_id)})
        
        # Respuesta de éxito con el correo del usuario
        return jsonify({
            "success": True,
            "message": "Reserva eliminada exitosamente",
            "email_usuario": email_usuario
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error al eliminar la reserva: {str(e)}"}), 500




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
















