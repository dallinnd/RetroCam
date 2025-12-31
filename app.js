/**
 * FILMCAM PRO - LOGIC ENGINE
 */

// 1. DATA: The 20 Retro Presets
const presets = [
    { name: "KODAK PORTRA 400", filter: "sepia(0.2) contrast(1.1) saturate(1.2)" },
    { name: "FUJI VELVIA", filter: "contrast(1.4) saturate(1.8) hue-rotate(-5deg)" },
    { name: "ILFORD HP5", filter: "grayscale(1) contrast(1.2) brightness(1.1)" },
    { name: "KODAK GOLD 200", filter: "sepia(0.4) brightness(1.1) contrast(1.1)" },
    { name: "AGFA VISTA 400", filter: "saturate(1.5) contrast(1.2) hue-rotate(10deg)" },
    { name: "POLAROID 600", filter: "sepia(0.2) brightness(1.1) contrast(0.9) hue-rotate(-10deg)" },
    { name: "KODACHROME 64", filter: "contrast(1.3) saturate(1.4) sepia(0.1)" },
    { name: "CINESTILL 800T", filter: "hue-rotate(160deg) saturate(0.8) contrast(1.1)" },
    { name: "LOMO PURPLE", filter: "hue-rotate(270deg) saturate(1.3)" },
    { name: "FUJI SUPERIA", filter: "hue-rotate(10deg) sepia(0.1) saturate(1.1)" },
    { name: "TECHNICOLOR", filter: "saturate(2.5) contrast(1.3)" },
    { name: "EKTACHROME", filter: "hue-rotate(190deg) saturate(1.2) brightness(1.05)" },
    { name: "CROSS PROCESS", filter: "contrast(1.5) hue-rotate(20deg) sepia(0.3)" },
    { name: "FADED 70S", filter: "brightness(1.2) contrast(0.8) sepia(0.3)" },
    { name: "NOIR", filter: "grayscale(1) contrast(1.8) brightness(0.8)" },
    { name: "SEPIA 1890", filter: "sepia(1) contrast(0.9) brightness(0.9)" },
    { name: "CYANOTYPE", filter: "hue-rotate(180deg) sepia(1) saturate(2) brightness(0.8)" },
    { name: "BLEACH BYPASS", filter: "saturate(0.4) contrast(1.6)" },
    { name: "WASHI S", filter: "grayscale(1) contrast(2.2)" },
    { name: "INSTANT TEAL", filter: "hue-rotate(150deg) sepia(0.4) saturate(1.1)" }
];

// 2. DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('photo-canvas');
const captureBtn = document.getElementById('capture-btn');
const filmLabel = document.getElementById('film-indicator');
const expIn = document.getElementById('exposure');
const warmIn = document.getElementById('warmth');
const galleryGrid = document.getElementById('gallery-grid');
const galleryThumb = document.getElementById('gallery-trigger');

let currentPreset = presets[0];
let directoryHandle = null;

// 3. Initialize Camera
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Camera access denied or not available.");
    }
}

// 4. Handle Filters and UI
function updatePreview() {
    const exp = expIn.value;
    const warm = warmIn.value / 100;
    // Apply combined preset + manual slider look to video
    video.style.filter = `${currentPreset.filter} brightness(${exp}) sepia(${warm})`;
}

function randomizeFilm() {
    currentPreset = presets[Math.floor(Math.random() * presets.length)];
    filmLabel.innerText = `LOADED: ${currentPreset.name}`;
    updatePreview();
}

[expIn, warmIn].forEach(el => el.addEventListener('input', updatePreview));

// 5. File System Logic
async function connectFolder() {
    try {
        // Asks user to select a folder (like DCIM)
        directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        loadGallery();
    } catch (err) {
        console.warn("Directory access declined.");
    }
}

async function loadGallery() {
    if (!directoryHandle) return;
    galleryGrid.innerHTML = '';
    
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.jpg')) {
            const file = await entry.getFile();
            const url = URL.createObjectURL(file);
            const img = document.createElement('img');
            img.src = url;
            img.className = 'gallery-item';
            galleryGrid.prepend(img); // Newest first
            galleryThumb.style.backgroundImage = `url(${url})`;
        }
    }
}

// 6. Capture and Save
captureBtn.addEventListener('click', async () => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply exact preview filter to the canvas
    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add Date & Model Stamp
    const dateStr = new Date().toLocaleDateString().replace(/\//g, '.');
    ctx.filter = "none";
    ctx.fillStyle = "rgba(255, 120, 0, 0.9)";
    ctx.font = "bold 40px 'Share Tech Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("LUMINA GX-70", canvas.width - 50, canvas.height - 100);
    ctx.fillText(dateStr, canvas.width - 50, canvas.height - 50);

    // Save Logic
    canvas.toBlob(async (blob) => {
        if (directoryHandle) {
            const name = `FILM_${Date.now()}.jpg`;
            const fileHandle = await directoryHandle.getFileHandle(name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            loadGallery();
        } else {
            // Fallback: Standard browser download if folder isn't connected
            const link = document.createElement('a');
            link.download = `FILM_${Date.now()}.jpg`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }
        
        // After every photo, change the film roll
        randomizeFilm();
    }, 'image/jpeg', 0.95);
});

// 7. Navigation
document.getElementById('gallery-trigger').addEventListener('click', () => {
    document.getElementById('gallery-screen').classList.remove('hidden');
});
document.getElementById('close-gallery').addEventListener('click', () => {
    document.getElementById('gallery-screen').classList.add('hidden');
});
document.getElementById('connect-folder').addEventListener('click', connectFolder);

// Start
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }
initCamera();
randomizeFilm();
