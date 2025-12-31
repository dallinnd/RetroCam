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

let currentPreset = presets[0];

function applyRandomPreset() {
    currentPreset = presets[Math.floor(Math.random() * presets.length)];
    document.getElementById('film-indicator').innerText = `LOADED: ${currentPreset.name}`;
    updateUI(); // Apply the visual change
}

function updateUI() {
    const exp = document.getElementById('exposure').value;
    const warm = document.getElementById('warmth').value;
    
    // Combine the chosen film preset with the user's slider adjustments
    video.style.filter = `${currentPreset.filter} brightness(${exp}) sepia(${warm/100})`;
}

// Inside your Capture Button Event Listener:
captureBtn.addEventListener('click', async () => {
    // ... (Your existing canvas drawing logic) ...
    
    // Use the combined filters for the save
    ctx.filter = video.style.filter;
    ctx.drawImage(video, 0, 0);

    // After saving, switch the "film roll"
    applyRandomPreset();
});
