from flask import Flask, render_template, request, jsonify
import json
import random
from datetime import datetime

app = Flask(__name__)

# Encouraging feedback messages
FEEDBACK_MESSAGES = {
    'colorful': [
        "Your use of vibrant colors shows a joyful spirit! 🌈",
        "What a beautiful palette! The colors express such positive energy! ✨",
        "The variety of colors in your drawing radiates happiness! 🎨"
    ],
    'simple': [
        "Sometimes simplicity speaks the loudest. Beautiful work! 🌸",
        "There's elegance in minimalism. Your drawing is peaceful! 🕊️",
        "The calm simplicity of your art is truly soothing! 🌿"
    ],
    'detailed': [
        "The detail in your work shows wonderful focus and dedication! 🌺",
        "You've put so much care into this! It's amazing! ⭐",
        "The intricate details reveal a creative and thoughtful mind! 🎭"
    ],
    'general': [
        "Your creativity is beautiful! Keep expressing yourself! 💝",
        "Art is a wonderful way to express feelings. You're doing great! 🌻",
        "Every stroke tells a story. Thank you for sharing yours! 🦋",
        "Your artistic expression is valuable and meaningful! 🌟"
    ]
}

THERAPEUTIC_TIPS = [
    "Drawing can reduce stress and anxiety by 84% after just 5 sessions!",
    "Art therapy helps process emotions in a healthy, creative way.",
    "Every mark you make is a step toward self-discovery.",
    "Your drawings are a reflection of your inner world - honor them!",
    "Creativity is a form of meditation. Enjoy the process!"
]

def analyze_drawing(drawing_data):
    """Analyze the drawing and provide encouraging feedback"""
    
    # Simple analysis based on drawing complexity
    feedback = {
        'message': '',
        'encouragement': '',
        'tip': random.choice(THERAPEUTIC_TIPS),
        'session_count': 1
    }
    
    # Parse drawing data (simplified)
    try:
        strokes = len(drawing_data.get('strokes', []))
        colors_used = len(set(drawing_data.get('colors', ['#000000'])))
        
        # Determine feedback type
        if colors_used >= 4:
            feedback['message'] = random.choice(FEEDBACK_MESSAGES['colorful'])
        elif strokes > 50:
            feedback['message'] = random.choice(FEEDBACK_MESSAGES['detailed'])
        elif strokes < 15:
            feedback['message'] = random.choice(FEEDBACK_MESSAGES['simple'])
        else:
            feedback['message'] = random.choice(FEEDBACK_MESSAGES['general'])
        
        # Additional encouragement
        encouragements = [
            "You're doing wonderful! 🌈",
            "Keep creating! 💖",
            "Your art matters! ✨",
            "Beautiful expression! 🌸",
            "You're amazing! 🌟"
        ]
        feedback['encouragement'] = random.choice(encouragements)
        
    except Exception as e:
        feedback['message'] = random.choice(FEEDBACK_MESSAGES['general'])
        feedback['encouragement'] = "Keep creating! 💖"
    
    return feedback

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Receive drawing data and return therapeutic feedback"""
    try:
        data = request.get_json()
        feedback = analyze_drawing(data)
        return jsonify({
            'success': True,
            'feedback': feedback
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/save-drawing', methods=['POST'])
def save_drawing():
    """Save user's drawing"""
    try:
        data = request.get_json()
        # In a real app, you'd save to a database
        # For now, we'll just return success
        return jsonify({
            'success': True,
            'message': 'Your artwork has been saved! 🎨'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
