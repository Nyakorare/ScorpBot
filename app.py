from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from google.generativeai import types
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

# Initialize Gemini client with direct API key
genai.configure(api_key="AIzaSyCjcQbhJw8D16TaRe6xL4r4-zAAz6dRmzo")

# Function to generate responses using Gemini
def generate(user_input):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(user_input)
        return response.text
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return f"Error: {str(e)}"

# Home route
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# Route to handle AJAX requests
@app.route("/send", methods=["POST"])
def send():
    try:
        user_input = request.json.get('user_input')
        if not user_input:
            return jsonify({'error': 'No input provided'}), 400
        response = generate(user_input)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in send route: {e}")
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)