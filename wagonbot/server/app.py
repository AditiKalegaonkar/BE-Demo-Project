from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import subprocess
import json

app = Flask(__name__)
CORS(app)

# Text from PDF
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
        return text

# Query Ollama
def query_ollama(prompt, model="llama2"):
    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input=prompt.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60
        )
        output = result.stdout.decode()
        return output.strip()
    except Exception as e:
        return f"Error querying Ollama: {str(e)}"

@app.route('/query', methods=['POST'])
def handle_query():
    data = request.json
    query = data.get('query')
    pdf_path = 'sample.pdf' 

    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        context = extract_text_from_pdf(pdf_path)
        prompt = f"""You are a helpful assistant. Use the following PDF content to answer the question.

PDF Content:
{context}

Question: {query}
Answer:"""

        answer = query_ollama(prompt)
        return jsonify({'answer': answer})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)