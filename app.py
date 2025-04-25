from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from google.generativeai import types
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize Gemini client with direct API key
genai.configure(api_key="AIzaSyCjcQbhJw8D16TaRe6xL4r4-zAAz6dRmzo")

# Function to generate responses using Gemini
def generate(user_input):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(user_input)
    return response.text

# Home route
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# Route to handle AJAX requests
@app.route("/send", methods=["POST"])
def send():
    user_input = request.json.get('user_input')
    response = generate(user_input)
    return jsonify({'response': response})

# Run the Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)