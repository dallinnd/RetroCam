const video = document.getElementById('video');
const canvas = document.getElementById('photo-canvas');
const captureBtn = document.getElementById('capture-btn');
const expIn = document.getElementById('exposure');
const warmIn = document.getElementById('warmth');
const grainIn = document.getElementById('grain-slider');
const grainDiv = document.getElementById('grain');

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
    } catch (e) { alert("Camera error: " + e); }
}

function updateUI() {
    video.style.filter = `brightness(${expIn.value}) sepia(${warmIn.value}%) contrast(1.1)`;
    grainDiv.style.opacity = grainIn.value;
}

[expIn, warmIn, grainIn].forEach(i => i.addEventListener('input', updateUI));

captureBtn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply Filters to Canvas
    ctx.filter = `brightness(${expIn.value}) sepia(${warmIn.value}%) contrast(1.1) saturate(1.2)`;
    ctx.drawImage(video, 0, 0);

    // Add Retro Stamp
    const now = new Date();
    const dateStr = now.toLocaleDateString().replace(/\//g, '.');
    ctx.filter = "none";
    ctx.fillStyle = "rgba(255, 120, 0, 0.85)";
    ctx.font = "bold 32px 'Share Tech Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("LUMINA GX-70", canvas.width - 40, canvas.height - 80);
    ctx.fillText(dateStr, canvas.width - 40, canvas.height - 40);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.download = `FILM_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    document.getElementById('last-photo-preview').style.backgroundImage = `url(${dataUrl})`;
});

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }
init();
