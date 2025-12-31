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

const video = document.getElementById('video');
const canvas = document.getElementById('photo-canvas');
const captureBtn = document.getElementById('capture-btn');
const filmLabel = document.getElementById('film-indicator');
const expIn = document.getElementById('exposure');
const warmIn = document.getElementById('warmth');
const doubleBtn = document.getElementById('double-toggle');
const galleryGrid = document.getElementById('gallery-grid');
const galleryThumb = document.getElementById('gallery-trigger');

let currentPreset = presets[0];
let directoryHandle = null;
let isDoubleMode = false;
let firstFrameData = null;

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
    } catch (e) { alert("Camera Permission Required."); }
}

function updateUI() {
    video.style.filter = `${currentPreset.filter} brightness(${expIn.value}) sepia(${warmIn.value/100})`;
}

function randomize() {
    currentPreset = presets[Math.floor(Math.random() * presets.length)];
    filmLabel.innerText = `LOADED: ${currentPreset.name}`;
    updateUI();
}

doubleBtn.addEventListener('click', () => {
    isDoubleMode = !isDoubleMode;
    doubleBtn.classList.toggle('active');
    doubleBtn.innerText = isDoubleMode ? "READY" : "OFF";
    firstFrameData = null;
    video.style.opacity = "1";
});

captureBtn.addEventListener('click', async () => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;

    if (isDoubleMode && !firstFrameData) {
        ctx.filter = video.style.filter;
        ctx.drawImage(video, 0, 0);
        firstFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        doubleBtn.innerText = "EXP 2";
        video.style.opacity = "0.6";
        return;
    }

    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0);

    if (isDoubleMode && firstFrameData) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').putImageData(firstFrameData, 0, 0);
        ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.6;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1.0;
        firstFrameData = null; video.style.opacity = "1"; doubleBtn.innerText = "READY";
    }

    const date = new Date().toLocaleDateString().replace(/\//g, '.');
    ctx.filter = "none"; ctx.fillStyle = "rgba(255, 120, 0, 0.9)";
    ctx.font = "bold 40px 'Share Tech Mono', monospace"; ctx.textAlign = "right";
    ctx.fillText(isDoubleMode ? "LUMINA GX-70 DBL" : "LUMINA GX-70", canvas.width - 40, canvas.height - 40);

    canvas.toBlob(async (blob) => {
        if (directoryHandle) {
            const handle = await directoryHandle.getFileHandle(`FILM_${Date.now()}.jpg`, { create: true });
            const writable = await handle.createWritable();
            await writable.write(blob); await writable.close();
            loadGallery();
        } else {
            const link = document.createElement('a'); link.download = `FILM_${Date.now()}.jpg`;
            link.href = URL.createObjectURL(blob); link.click();
        }
        if (!isDoubleMode) randomize();
    }, 'image/jpeg', 0.9);
});

async function loadGallery() {
    if (!directoryHandle) return;
    galleryGrid.innerHTML = '';
    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file') {
            const file = await entry.getFile();
            const url = URL.createObjectURL(file);
            const img = document.createElement('img');
            img.src = url; img.className = 'gallery-item';
            galleryGrid.prepend(img);
            galleryThumb.style.backgroundImage = `url(${url})`;
        }
    }
}

[expIn, warmIn].forEach(i => i.addEventListener('input', updateUI));
document.getElementById('gallery-trigger').addEventListener('click', () => document.getElementById('gallery-screen').classList.remove('hidden'));
document.getElementById('close-gallery').addEventListener('click', () => document.getElementById('gallery-screen').classList.add('hidden'));
document.getElementById('connect-folder').addEventListener('click', async () => { directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' }); loadGallery(); });

init(); randomize();
