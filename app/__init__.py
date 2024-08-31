from flask import Flask
from .models import db

def create_app():
    app = Flask(__name__)

    # Configuración de la base de datos
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        # Importa rutas para asegurarse de que se registren después de inicializar la aplicación
        from . import routes

        # Crear las tablas de la base de datos
        db.create_all()

    return app
