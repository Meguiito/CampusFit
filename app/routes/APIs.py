from flask import Flask, request, jsonify, send_file
from flask_pymongo import PyMongo
from flask_cors import CORS
import bcrypt
import os
import magic
from datetime import datetime, timedelta,timezone
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import json
from bson import ObjectId
from gridfs import GridFS
import pytz
import locale
from flask_mail import Mail, Message
from pymongo import MongoClient
import io
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

locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')





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
                                                     .replace("Friday", "Viernes").replace("Saturday", "Sabado")\
                                                     .replace("Sunday", "domingo").replace("January", "enero")\
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






@app.route('/obtener_reservas_especiales_aceptadas', methods=['GET'])
@jwt_required()
def obtener_reservas_especiales_aceptadas():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403


        reservas_especiales_aceptadas = mongo.db.Reservas_especiales_aceptadas.find()

        reservas_list = []
        for reserva in reservas_especiales_aceptadas:
            reserva['_id'] = str(reserva['_id'])  
            reservas_list.append(reserva)

        return jsonify(reservas_list), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500






@app.route('/obtener_reservas_especiales_rechazadas', methods=['GET'])
@jwt_required()
def obtener_reservas_especiales_rechazadas():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')

        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403


        reservas_especiales_rechazadas = mongo.db.Reservas_especiales_rechazadas.find()

        reservas_list = []
        for reserva in reservas_especiales_rechazadas:
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

        object_id = None
        try:
            object_id = ObjectId(mongo_id)
        except Exception:
            pass  

        reserva = False
        colecciones = [
            mongo.db.Reservas_especiales_aceptadas,
            mongo.db.Reservas_especiales_rechazadas,
        ]
        reserva = mongo.db.Reservas_especiales.find_one({"_id": object_id}) 
        if not reserva:
            for coleccion in colecciones:
                reserva = coleccion.find_one({"_id": mongo_id}) 
                if reserva:
                    break  

        if not reserva:
            return jsonify({"error": "Reserva especial no encontrada"}), 404
        
        file_id = reserva.get("file_id")
        if not file_id:
            return jsonify({"error": "No se encontró el ID del archivo PDF"}), 404

        try:
            file_data = fs.get(ObjectId(file_id))
        except Exception:
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





@app.route('/aceptar_reserva_especial', methods=['POST'])
@jwt_required()
def aceptar_reserva_especial():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')
        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        data = request.get_json()
        documentos = data.get('documentos')
        reserva = data.get('reserva')

        if not isinstance(documentos, list):
            return jsonify({"error": "Datos inválidos. 'documentos' debe ser una lista."}), 400
        if not documentos:
            return jsonify({"error": "Datos inválidos. La lista 'documentos' no debe estar vacía."}), 400
        if not isinstance(reserva, dict) or not reserva:
            return jsonify({"error": "Datos inválidos. 'reserva' debe ser un diccionario no vacío."}), 400

        mensajes_conflicto = []
        reservas_no_conflictivas = []
        reservas_borradas = []

        for documento in documentos:
            fecha_str = documento.get('fecha')
            hora = documento.get('hora')
            cancha = documento.get('cancha')
            equipo = documento.get('equipo')

            if not fecha_str or not hora or not cancha or not equipo:
                return jsonify({"error": "Cada documento debe incluir 'fecha', 'hora', 'cancha' y 'equipo'"}), 400

            try:
                fecha_obj = datetime.strptime(fecha_str, '%d-%m-%Y')
                dia_semana = fecha_obj.strftime('%A').lower()
                dia = fecha_obj.day
                mes = fecha_obj.strftime('%B')
            except ValueError:
                return jsonify({"error": f"Formato de fecha inválido: {fecha_str}. Se espera 'DD-MM-YYYY'"}), 400

            reserva_conflictiva = mongo.db.Reservas.find_one({
                'fecha': fecha_str,
                'hora': hora,
                'cancha': cancha,
                'id_reserva_especial': {'$exists': True}
            })

            reserva_conflictiva_2 = mongo.db.Reservas.find_one({
                'fecha': fecha_str,
                'hora': hora,
                'equipo': equipo,
                'id_reserva_especial': {'$exists': True}
            })

            if reserva_conflictiva:
                mensajes_conflicto.append(
                    f"Conflicto: El día {dia_semana} {dia} de {mes} la cancha '{cancha}' ya está reservada a las {hora}."
                )
            elif reserva_conflictiva_2:
                mensajes_conflicto.append(
                    f"Conflicto: El día {dia_semana} {dia} de {mes} el equipo '{equipo}' ya está reservado a las {hora}."
                )
            else:
                reservas_no_conflictivas.append(documento)

        if mensajes_conflicto:
            return jsonify({
                "message": "No se pudieron procesar las reservas debido a conflictos con otras reservas.",
                "conflictos": mensajes_conflicto
            }), 400

        # Proceso de eliminación de reservas normales y notificación
        for documento in reservas_no_conflictivas:
            fecha_str = documento.get('fecha')
            hora = documento.get('hora')
            cancha = documento.get('cancha')

            reservas_a_borrar = mongo.db.Reservas.find({
                'fecha': fecha_str,
                'hora': hora,
                'cancha': cancha,
                'id_reserva_especial': {'$exists': False}
            })

            for reserva_borrada in reservas_a_borrar:
                reservas_borradas.append(reserva_borrada)
                try:
                    # Enviar notificación al usuario afectado
                    email_usuario = reserva_borrada.get('email')
                    if email_usuario:
                        notificacion_general(caso=3, email=email_usuario, fecha=fecha_str)
                except Exception as e:
                    return jsonify({
                        "error": f"Error al enviar notificación a {reserva_borrada.get('email')}: {str(e)}"
                    }), 500

            mongo.db.Reservas.delete_many({
                'fecha': fecha_str,
                'hora': hora,
                'cancha': cancha,
                'id_reserva_especial': {'$exists': False}
            })

            mongo.db.Reservas.insert_one(documento)

        # Procesar reserva especial aprobada
        resultado_proceso = procesar_reserva_especial(reserva)
        if resultado_proceso != True:
            for reserva_borrada in reservas_borradas:
                mongo.db.Reservas.insert_one(reserva_borrada)

            return jsonify({
                "error": f"Error al procesar la reserva especial: {resultado_proceso}. Se ha realizado un rollback."
            }), 500

        # Enviar notificación de aprobación al solicitante de la reserva especial
        email_usuario = reserva.get('user_email')
        upload_date = reserva.get('upload_date')

        if not email_usuario or not upload_date:
            return jsonify({"error": "La reserva no contiene los datos necesarios para enviar la notificación."}), 400

        try:
            notificacion_reserva_especial(
                caso=1,
                email=email_usuario,
                fecha_solicitud=upload_date
            )
        except Exception as e:
            return jsonify({
                "error": f"Reserva aprobada, pero falló el envío de notificación: {str(e)}"
            }), 500

        return jsonify({
            "message": "Reserva especial aprobada, reservas normales guardadas y notificación enviada.",
            "Reservas normales borradas": reservas_borradas,
        }), 201

    except PyMongoError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500





def procesar_reserva_especial(reserva):
    try:
        if '_id' not in reserva:
            return "El JSON no contiene el campo '_id'." 

        mongo.db.Reservas_especiales_aceptadas.insert_one(reserva)

        try:
            object_id = ObjectId(reserva["_id"])
        except Exception as e:
            return f"El campo '_id' no es un ObjectId válido: {str(e)}"  

        delete_result = mongo.db.Reservas_especiales.delete_one({"_id": object_id})
        if delete_result.deleted_count == 0:
            return "No se encontró ninguna reserva para eliminar en `Reservas_especiales`." 

        return True  

    except PyMongoError as e:
        return f"Error en la base de datos: {str(e)}"
    except Exception as e:
        return f"Error inesperado: {str(e)}"





@app.route('/copia_reserva_especial_rechazada', methods=['POST'])
@jwt_required()
def copia_reserva_especial_rechazada():
    try:
        # Verificar si el usuario es administrador
        identity = get_jwt_identity()
        email = identity.get('email')
        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        # Procesar el cuerpo de la solicitud
        data = request.get_json()
        if not data or '_id' not in data:
            return jsonify({"error": "El JSON enviado no contiene un campo '_id' válido."}), 400

        # Validar el ObjectId
        try:
            object_id = ObjectId(data["_id"])
        except Exception as e:
            return jsonify({"error": f"El campo '_id' no es un ObjectId válido: {str(e)}"}), 400

        # Insertar en la colección de rechazados
        mongo.db.Reservas_especiales_rechazadas.insert_one(data)

        # Buscar y eliminar la reserva especial original
        reserva = mongo.db.Reservas_especiales.find_one_and_delete({"_id": object_id})
        if not reserva:
            return jsonify({
                "message": "Reserva especial rechazada almacenada, pero no se encontró ninguna reserva para eliminar en `Reservas_especiales`.",
            }), 201

        # Obtener datos de la reserva para enviar la notificación
        email_usuario = reserva.get('user_email')
        upload_date = reserva.get('upload_date')

        if not email_usuario or not upload_date:
            return jsonify({"error": "La reserva no contiene los datos necesarios para enviar la notificación."}), 400

        # Enviar notificación de reserva rechazada
        try:
            notificacion_reserva_especial(
                caso=2,
                email=email_usuario,
                fecha_solicitud=upload_date
            )
        except Exception as e:
            return jsonify({
                "error": f"Reserva rechazada, pero falló el envío de notificación: {str(e)}"
            }), 500

        return jsonify({
            "message": "Reserva especial rechazada almacenada, eliminada de `Reservas_especiales`, y notificación enviada."
        }), 201

    except PyMongoError as e:
        if "duplicate key error" in str(e):
            return jsonify({"error": "El ID especificado ya existe en la base de datos."}), 400
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



@app.route('/eliminar_reserva_especial', methods=['POST'])
@jwt_required()
def eliminar_reserva_especial():
    try:
        identity = get_jwt_identity()
        email = identity.get('email')
        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403
        
        reserva_especial = request.get_json()
        id_reserva_especial = reserva_especial.get("_id")

        if not id_reserva_especial:
            return jsonify({"error": "No se proporcionó el ID de la reserva especial."}), 400
        
        reservas_a_eliminar = mongo.db.Reservas.find({'id_reserva_especial': id_reserva_especial})
        reservas_borradas = []
        if reservas_a_eliminar:
            for reserva in reservas_a_eliminar:
                reservas_borradas.append(reserva)
                mongo.db.Reservas_borradas.insert_one(reserva)  

        mongo.db.Reservas.delete_many({'id_reserva_especial': id_reserva_especial})

        mongo.db.Reservas_especiales_aceptadas.delete_one({'_id': id_reserva_especial})

        return jsonify({
            "message": "Reserva especial y las reservas normales asociadas fueron eliminadas con éxito",
        }), 200

    except Exception as e:
        try:
            if reservas_borradas:
                for reserva in reservas_borradas:
                    if not mongo.db.Reservas.find_one({'_id': reserva['_id']}):
                        mongo.db.Reservas.insert_one(reserva)

            if 'reserva_especial' in locals() and not mongo.db.Reservas_especiales_aceptadas.find_one({'_id': reserva_especial['_id']}):
                mongo.db.Reservas_especiales_aceptadas.insert_one(reserva_especial)

            return jsonify({"error": f"Error inesperado: {str(e)}. Rollback realizado."}), 500
        except Exception as rollback_error:
            return jsonify({"error": f"Error en el rollback: {str(rollback_error)}"}), 500


    


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


        re = mongo.db.Reservas_especiales.count_documents({"user_email": email})
        rea = mongo.db.Reservas_especiales_aceptadas.count_documents({"user_email": email})
        rer = mongo.db.Reservas_especiales_rechazadas.count_documents({"user_email": email})
        if (re + rea + rer) >= 2:
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
        # Obtener la identidad del token
        identity = get_jwt_identity()
        email = identity.get('email')

        # Verificar si el usuario es un administrador
        admin_user = mongo.db.Admin.find_one({'email': email})
        if not admin_user:
            return jsonify({"error": "Acceso denegado: solo administradores"}), 403

        # Obtener la fecha actual en el formato necesario
        fecha_actual = datetime.now().strftime('%d-%m-%Y')

        # Filtrar las reservas para la fecha actual
        reservas = list(mongo.db.Reservas.find({
            "fecha": fecha_actual,
            "$or": [
                {"email": {"$exists": True}},  # Condición para 'email'
                {"email_usuario_reserva_especial": {"$exists": True}}  # Condición para 'email_usuario_reserva_especial'
            ]
        }).sort("hora", 1))  # Ordenar por la hora

        # Si no hay reservas para la fecha, devolver mensaje adecuado
        if not reservas:
            return jsonify({"message": "No hay reservas para el día de hoy."}), 200

        # Filtrar y estructurar las reservas encontradas
        reservas_filtradas = [{
            "cancha": reserva.get("cancha"),
            "equipo": reserva.get("equipo"),
            "email": reserva.get("email") or reserva.get("email_usuario_reserva_especial"),  # Obtener el email adecuado
            "hora": reserva.get("hora")
        } for reserva in reservas]

        return jsonify(reservas_filtradas), 200

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

    





@app.route('/admin/reservas-agrupadas', methods=['GET'])
@jwt_required()
def obtener_reservas_agrupadas():
    try:
        # Filtrar las reservas que NO tengan el campo 'email_usuario_reserva_especial'
        reservas = list(mongo.db.Reservas.find({
            "email_usuario_reserva_especial": {"$exists": False}  # Filtra las reservas sin este campo
        }))

        # Formatear las reservas para la respuesta
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
        return jsonify({"error": f"Error al obtener las reservas: {str(e)}"}), 500

    



@app.route('/admin/eliminar-reserva', methods=['POST'])
@jwt_required()
def eliminar_reserva():
    # Obtener los datos del cuerpo de la solicitud
    data = request.get_json()
    reserva_id = data.get("reservaId")
    
    # Obtener el email desde el JWT
    identity = get_jwt_identity()
    email = identity.get("email")

    # Verificar que el campo reserva_id esté presente
    if not reserva_id:
        return jsonify({"success": False, "message": "ID de la reserva es requerido"}), 400

    # Verificar que el usuario autenticado sea el administrador autorizado
    if email != "admin@uctadmin.cl":
        return jsonify({"success": False, "message": "Acceso no autorizado"}), 403

    try:
        # Buscar la reserva por ID en la colección "Reservas"
        reserva = mongo.db.Reservas.find_one({"_id": ObjectId(reserva_id)})
        if not reserva:
            return jsonify({"success": False, "message": "Reserva no encontrada"}), 404

        # Guardar el correo del usuario que hizo la reserva
        email_usuario = reserva["email_usuario"]
        fecha_reserva = reserva["fecha"]  # Asegúrate de que el campo 'fecha' exista en la reserva

        # Eliminar la reserva
        mongo.db.Reservas.delete_one({"_id": ObjectId(reserva_id)})

        # Enviar notificación al usuario
        try:
            notificacion_general(2, email_usuario, fecha_reserva)
        except Exception as e:
            # Loguear el error, pero no interrumpir la ejecución principal
            print(f"Error al enviar notificación: {str(e)}")

        # Respuesta de éxito con el correo del usuario
        return jsonify({
            "success": True,
            "message": "Reserva eliminada exitosamente y notificación enviada",
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




@app.route('/api/sanciones/<email>', methods=['GET'])
@jwt_required()
def obtener_sanciones(email):
    try:
        sanciones_totales = mongo.db.Sancionados.count_documents({"email": email})
        sanciones_activas = mongo.db.Sancionados.count_documents({
            "email": email,
            "startDate": {"$lte": datetime.utcnow()},
            "endDate": {"$gte": datetime.utcnow()}
        })

        return jsonify({
            "sanciones": sanciones_totales,
            "sancionesActivas": sanciones_activas
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener sanciones: {str(e)}"}), 500
    
@app.route('/api/sancionar', methods=['POST'])
@jwt_required()
def sancionar():
    try:
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        email = data.get('email')
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')

        # Convertir las fechas desde ISO 8601 a objetos datetime
        start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
        end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))

        # Aquí puedes hacer las validaciones, como comprobar la existencia de sanciones, etc.

        # Guardar la sanción en MongoDB
        mongo.db.Sancionados.insert_one({
            "email": email,
            "startDate": start_date,
            "endDate": end_date
        })

        # Enviar notificación al usuario sobre la sanción
        notificacion_general(1, email, end_date.strftime('%Y-%m-%d'))

        # Responder al cliente con éxito
        return jsonify({"message": "Sanción registrada exitosamente y notificación enviada"}), 200
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 400

@app.route('/api/usuarios/<email>/sancion-activa', methods=['GET'])
def verificar_sancion_activa(email):
    try:
        sancion_activa = mongo.db.Sancionados.find_one({
            "email": email,
            "startDate": {"$lte": datetime.utcnow()},
            "endDate": {"$gte": datetime.utcnow()}
        })

        if sancion_activa:
            return jsonify({
                "isSanctioned": True,
                "fechaFinSancion": sancion_activa['endDate'].strftime('%Y-%m-%d')  # Formato de fecha
            }), 200

        return jsonify({"isSanctioned": False}), 200
    except Exception as e:
        return jsonify({"error": f"Error al verificar sanción activa: {str(e)}"}), 500


@app.route('/api/sancionados', methods=['GET'])
@jwt_required()
def listar_sancionados():
    try:
        if get_jwt_identity() != "admin@uctadmin.cl":
            return jsonify({"error": "No autorizado"}), 403

        sancionados = list(mongo.db.Sancionados.find({}, {"_id": 0}))
        return jsonify({"sancionados": sancionados}), 200
    except Exception as e:
        return jsonify({"error": f"Error al listar sancionados: {str(e)}"}), 500


scheduler.add_job(
    func=eliminar_reservas_antiguas,
    trigger='cron',
    day_of_week='mon',
    hour=2,
    minute=0,
    id='eliminar_reservas_antiguas',
    replace_existing=True
)




#-----------------------------------------------------------------------------------------------------#

app.config['MAIL_SERVER'] = 'smtp.sendgrid.net'
app.config['MAIL_PORT'] = 587  # Para conexiones TLS
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'apikey'  # Este es el usuario fijo de SendGrid
app.config['MAIL_PASSWORD'] = 'apiki'

mail = Mail(app)

def enviar_notificacion(correo_destino, asunto, mensaje):
    """Envía un correo electrónico a un destinatario específico."""
    with app.app_context():
        msg = Message(
            subject=asunto,
            recipients=[correo_destino],  # El destinatario
            body=mensaje,  # El contenido del mensaje
            sender='botnotificacionescampusfit@gmail.com'  # Remitente
        )
        # Asignando el correo de respuesta
        msg.reply_to = 'fvaldes2023@alu.uct.cl'
        mail.send(msg)


def notificacion_general(caso, email, fecha):
    """Envía una notificación general al usuario dependiendo del caso."""
    # Definir los mensajes según el caso
    if caso == 1:
        asunto = "Notificación de sanción"
        mensaje = f"Usuario {email}, fuiste sancionado hasta el {fecha}. Si sientes que es de manera injusta o injustificada, acércate a la oficina de deportes para conversar tu situación."
    
    elif caso == 2:
        asunto = "Notificación de eliminación de reserva"
        mensaje = f"Usuario {email}, tu reserva del día {fecha} fue eliminada por el administrador. Si sientes que es injustificada, acércate a la oficina de deportes."
    
    elif caso == 3:
        asunto = "Notificación de reserva eliminada por evento"
        mensaje = f"Usuario {email}, tu reserva del {fecha} fue eliminada debido a un evento que se llevará a cabo en ese lugar en la misma fecha. Lamentamos lo sucedido."
    else:
        raise ValueError("El caso debe ser 1, 2 o 3.")
    
    # Llamamos a la función de envío de correo que ya has configurado
    enviar_notificacion(email, asunto, mensaje)


def notificacion_reserva_especial(caso, email, fecha_solicitud):
    """
    Envía una notificación específica para reservas especiales dependiendo del caso.

    Parámetros:
    - caso (int): 1 para aprobada, 2 para rechazada.
    - email (str): Correo electrónico del usuario.
    - fecha_solicitud (str): Fecha de subida de la solicitud (formato: "lunes 25 de noviembre a las 00:58").
    """
    if caso == 1:
        asunto = "Reserva Especial Aprobada"
        mensaje = (
            f"Usuario {email}, su reserva especial solicitada el {fecha_solicitud} "
            f"fue aprobada con éxito. ¡Esperamos que disfrute la experiencia en las zonas deportivas de la UCT!"
        )
    elif caso == 2:
        asunto = "Reserva Especial Rechazada"
        mensaje = (
            f"Usuario {email}, lamentamos informarle que su reserva especial solicitada el {fecha_solicitud} "
            f"fue rechazada por el administrador. Si tiene dudas o reclamos, puede acercarse a las oficinas "
            f"del administrador para aclararlas."
        )
    else:
        raise ValueError("El caso debe ser 1 o 2.")

    # Llamar a la función de envío de correo ya configurada
    enviar_notificacion(email, asunto, mensaje)





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














