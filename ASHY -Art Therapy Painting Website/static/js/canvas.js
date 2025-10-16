// Canvas Drawing Application
class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.strokes = [];
        this.colorsUsed = new Set(['#000000']);
        
        this.initCanvas();
        this.attachEventListeners();
    }
    
    initCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Set initial canvas background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    attachEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // Color palette
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
                this.colorsUsed.add(this.currentColor);
            });
        });
        
        // Brush size
        const brushSizeInput = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        brushSizeInput.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            brushSizeValue.textContent = e.target.value;
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeDrawing();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.ctx.putImageData(imageData, 0, 0);
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Track stroke
        this.strokes.push({
            x: pos.x,
            y: pos.y,
            color: this.currentColor,
            size: this.brushSize
        });
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.closePath();
        }
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.strokes = [];
        this.colorsUsed = new Set([this.currentColor]);
        
        // Hide feedback
        const feedbackCard = document.getElementById('feedbackCard');
        feedbackCard.classList.add('hidden');
    }
    
    async analyzeDrawing() {
        if (this.strokes.length === 0) {
            alert('Please draw something first! 🎨');
            return;
        }
        
        try {
            // Prepare drawing data
            const drawingData = {
                strokes: this.strokes,
                colors: Array.from(this.colorsUsed),
                timestamp: new Date().toISOString()
            };
            
            // Send to backend for analysis
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(drawingData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayFeedback(result.feedback);
            } else {
                alert('Error analyzing drawing. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server. Please try again.');
        }
    }
    
    displayFeedback(feedback) {
        const feedbackCard = document.getElementById('feedbackCard');
        const feedbackMessage = document.getElementById('feedbackMessage');
        const encouragementMessage = document.getElementById('encouragementMessage');
        const therapeuticTip = document.getElementById('therapeuticTip');
        
        feedbackMessage.textContent = feedback.message;
        encouragementMessage.textContent = feedback.encouragement;
        therapeuticTip.textContent = feedback.tip;
        
        feedbackCard.classList.remove('hidden');
        
        // Scroll to feedback
        feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add animation
        feedbackCard.style.animation = 'none';
        setTimeout(() => {
            feedbackCard.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DrawingApp();
    console.log('🎨 Therapeutic Drawing App initialized!');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
