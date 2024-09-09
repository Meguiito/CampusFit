import bcrypt
from conex import * 
from flask import Flask, render_template, request, jsonify

reg = Flask(__name__)

@reg.route('/')
def formulario():
    return render_template('')

@reg.route('/register', methods=['POST'])
def register():
    rut = request.form.get('rut')
    nombre = request.form.get('nombre')
    correo = request.form.get('correo')
    contrasena = request.form.get('contraseña')

    usuario_existente = coleccion.find_one({"$or": [{"correo": correo}, {"rut": rut}]})
    
    if usuario_existente:
        if usuario_existente['correo'] == correo:
            return jsonify({"mensaje": "El correo institucional ya está registrado"}), 400
        elif usuario_existente['rut'] == rut:
            return jsonify({"mensaje": "El RUT ya está registrado"}), 400
        
    salt = bcrypt.gensalt()
    contrasena_hash = bcrypt.hashpw(contrasena.encode('utf-8'), salt)

    datos_registro = {
        "rut": rut,
        "nombre": nombre,
        "correo": correo,
        "contraseña": contrasena_hash  
    }

    coleccion.insert_one(datos_registro)

    return jsonify({"mensaje": "Usuario registrado exitosamente"}), 200

if __name__ == '__main__':
    reg.run(debug=True)
