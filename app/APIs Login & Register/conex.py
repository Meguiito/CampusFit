from pymongo import MongoClient
cliente = MongoClient("mongodb+srv://vicentealvarez2023:1000Hppower.@campusfit.xih68.mongodb.net/")
db = cliente["CampusFIT_DB"]
coleccion = db["Usuarios"]