from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import re

app = Flask(__name__)

client = MongoClient('mongodb://localhost:27017/')
db = client['mi_base_de_datos']
users_collection = db['usuarios']

def validar_rut(rut):
    return len(rut) == 9 and re.match(r'^\d{8}[0-9Kk]$', rut)

def validar_correo(correo):
    return re.match(r'^[a-zA-Z0-9._%+-]+@(alu\.uct\.cl|uct\.cl)$', correo)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    rut = data['rut']
    nombre = data['nombre']
    carrera = data['carrera']
    contraseña = data['contraseña']
    correo = data['correo']

    # Validaciones
    if not validar_rut(rut):
        return jsonify({'error': 'RUT inválido. Debe tener 9 caracteres y el último puede ser un dígito o K.'}), 400
    if not validar_correo(correo):
        return jsonify({'error': 'Correo inválido. Debe ser de dominio alu.uct.cl o uct.cl.'}), 400

    # Hash de la contraseña
    hashed_pw = bcrypt.hashpw(contraseña.encode('utf-8'), bcrypt.gensalt())

    user = {
        'rut': rut,
        'nombre': nombre,
        'carrera': carrera,
        'contraseña': hashed_pw,
        'correo': correo
    }

    users_collection.insert_one(user)
    return jsonify({'msg': 'Usuario registrado exitosamente'}), 201

if __name__ == '__main__':
    app.run(debug=True)
