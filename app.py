from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

@app.route('/')
def index():
    lang = request.args.get("lang", "en")
    if lang == "hi":
        return render_template("index_hi.html", lang='hi')  # passing 'lang' for consistency
    elif lang =="mr":
        return render_template("index_mr.html", lang='mr')
    return render_template("index.html", lang='en')  # passing 'lang' for consistency



@app.route('/i_title')
@app.route('/i_title/<lang>')

def i_title_page(lang='en'):
    if lang == "hi":
        return render_template('i_title_hi.html',lang='hi')
    elif lang == "mr":
        return render_template('i_title_mr.html',lang='mr')
    return render_template('i_title.html')



@app.route('/refine', methods=['POST'])
def refine():
    data = request.get_json()
    user_text = data.get("text", "")
    video_length = data.get("videoLength", "0")  # Default to 0 if not provided
    platform = data.get("platform", "")  # Platform the script should be for

    if not user_text.strip():
        return jsonify({"error": "Empty input"}), 400


    # Constructing the system message for the model with video length and platform
    system_content = (
        f"Refine this text and make it {video_length} minutes long for speech. "
        f"The generated text should be suitable for the teaching"
    )

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
        "messages": [
            {
                "role": "system",
                "content": system_content
            },
            {
                "role": "user",
                "content": user_text
            }
        ],
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 500
    }

    response = requests.post("https://api.together.xyz/v1/chat/completions", headers=headers, json=body)

    if response.status_code == 200:
        refined_text = response.json()['choices'][0]['message']['content']
        return jsonify({"refined": refined_text})
    else:
        return jsonify({"error": "API call failed", "details": response.text}), 500


if __name__ == '__main__':
    app.run(debug=True)


# Add this at the end of your file
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)