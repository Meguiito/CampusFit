from flask import Blueprint, request, jsonify
import os
import magic
from pymongo import MongoClient
from datetime import datetime

cliente = MongoClient("mongodb+srv://vicentealvarez2023:1000Hppower.@campusfit.xih68.mongodb.net/")
db = cliente["CampusFIT_DB"]
reservas_collection= db["Reservas_especiales"]


special_requests = Blueprint('special_requests', __name__)

@special_requests.route('/special_request', methods=['POST'])
def handle_special_request():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

   
    mime_type = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)  

    if mime_type != 'application/pdf':
        return jsonify({"error": "File is not a valid PDF"}), 400

    filepath = os.path.join('uploads', file.filename)
    file.save(filepath)

    
    reserva_data = {
        "filename": file.filename,
        "filepath": filepath,
        "upload_date": datetime.utcnow(),
    }

    
    result = reservas_collection.insert_one(reserva_data)

    
    return jsonify({
        "message": "PDF uploaded successfully",
        "file_path": filepath,
        "mongo_id": str(result.inserted_id)  
    }), 200
