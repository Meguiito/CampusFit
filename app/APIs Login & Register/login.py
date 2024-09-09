import bcrypt
from conex import *
from flask import Flask, render_template, request, jsonify

log = Flask(__name__)

@log.route('/')
def formulario():
    return render_template('')

@log.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        correo = request.form.get('correo')
        contrasena = request.form.get('contraseña')

        user = coleccion.find_one({"correo": correo})

        if user:
            contrasena_hash = user['contraseña']

            if bcrypt.checkpw(contrasena.encode('utf-8'), contrasena_hash):
                return jsonify({"mensaje": "Inicio de sesión exitoso"})
            else:
                return jsonify({"error": "Contraseña incorrecta"}), 401
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404


if __name__ == '__main__':
    log.run(debug=True)
