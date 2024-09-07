from flask import Blueprint, request, jsonify
import os
from PyPDF2 import PdfReader
import magic 

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

    try:

        reader = PdfReader(file)
        if not reader.pages:  
            return jsonify({"error": "The PDF file might be corrupt or empty"}), 400
    except Exception as e:
        print(f"Error al procesar el archivo: {e}")
        return jsonify({"error": "The PDF file might be corrupt or unsafe"}), 400


    filepath = os.path.join('uploads', file.filename)
    file.seek(0)  
    file.save(filepath)

    return jsonify({"message": "PDF uploaded and processed successfully", "file_path": filepath}), 200
