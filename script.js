// Selecting elements
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const eraser = document.getElementById('eraser');
const clearCanvas = document.getElementById('clearCanvas');
const undoWork = document.getElementById('undo');
const redoWork = document.getElementById('redo');

// History management for undo/redo
let history = [];
let redoStack = [];

// Setting canvas dimensions to fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.querySelector('.toolbar').offsetHeight;
    if (history.length > 0) {
        restoreState(history[history.length - 1]); // Restore the last canvas state on resize
    }
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Initial settings
let drawing = false;
let currentColor = colorPicker.value;
let currentBrushSize = brushSize.value;
let isErasing = false;

// Update brush color
colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
    isErasing = false;
    eraser.classList.remove('active');
});

// Update brush size
brushSize.addEventListener('change', (e) => {
    currentBrushSize = e.target.value;
});

// Toggle eraser
eraser.addEventListener('click', () => {
    isErasing = !isErasing;
    if (isErasing) {
        eraser.classList.add('active');
    } else {
        eraser.classList.remove('active');
    }
});

// Clear the canvas
clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save the state after clearing
});

// Drawing functions
function startPosition(e) {
    drawing = true;
    draw(e);
}

function endPosition() {
    drawing = false;
    ctx.beginPath();
    saveState(); // Save canvas state after drawing
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isErasing ? '#FFFFFF' : currentColor;

    ctx.lineTo(e.clientX, e.clientY - document.querySelector('.toolbar').offsetHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY - document.querySelector('.toolbar').offsetHeight);
}

// Event listeners for mouse
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Optional: Support touch devices
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startPosition(touch);
});

canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling when drawing
    const touch = e.touches[0];
    draw(touch);
});

// Save the current canvas state
function saveState() {
    // Only push the current state if it's different from the last state
    const state = canvas.toDataURL();
    if (history.length === 0 || history[history.length - 1] !== state) {
        history.push(state);
        redoStack = []; // Clear redo stack after new drawing
        updateButtons();
    }
}

// Restore a specific canvas state
function restoreState(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Undo function
undoWork.addEventListener('click', () => {
    if (history.length > 1) {
        redoStack.push(history.pop()); // Move the last state to redo stack
        restoreState(history[history.length - 1]); // Restore the previous state
    } else if (history.length === 1) {
        redoStack.push(history.pop()); // Move the last state to redo stack
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas if no history left
    }
    updateButtons();
});

// Redo function
redoWork.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        restoreState(redoState); // Restore the next state
        history.push(redoState); // Add the restored state back to history
    }
    updateButtons();
});


function updateButtons() {
    undoWork.disabled = history.length <= 1;
    redoWork.disabled = redoStack.length === 0;
}

// Save the initial state when the page loads
saveState();