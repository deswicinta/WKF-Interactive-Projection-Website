import { sendPostcardData } from "./firebase.js";

// Flower design data
const designs = [
    { src: "assets/hydrangea_biru.png",         name: "Hydrangea Biru",          type: "Semi Holland" },
    { src: "assets/carnation_std_putih.png",    name: "Carnation Std Putih",     type: "Semi Holland" },
    { src: "assets/gerbera.png",                name: "Gerbera",                 type: "Gerbera" },
    { src: "assets/krisan_standard.png",        name: "Krisan Standard",         type: "Krisan Standard" },
    { src: "assets/rl_pink.png",                name: "R.L. Pink",               type: "Rose Local Super" }
];

let badWords = [];
let currentIndex = 1;
let isTransitioning = false;
const track = document.getElementById("track");

// Load profanity filter list
async function loadBadWords() {
    try {
        const text = await (await fetch('./optional-data/kata-kasar.txt')).text();
        badWords = text.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
    } catch (e) {
        console.error("Failed to load bad words:", e);
    }
}

function initCarousel() {
    track.innerHTML = "";

    const append = (design, id) => {
        const el = createSlide(design);
        if (id) el.id = id;
        track.appendChild(el);
    };

    append(designs.at(-1), "lastClone");
    designs.forEach((d, i) => {
        const el = createSlide(d);
        el.dataset.realIndex = i;
        track.appendChild(el);
    });
    append(designs[0], "firstClone");

    track.style.transform = `translateX(${-100 * currentIndex}%)`;
}

// Perbaikan: menggunakan design.name dan design.type
function createSlide(design) {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `
        <img src="${design.src}" alt="${design.name}">
        <div class="meta-info">
            <span class="meta-title">${design.name}</span>
            <span class="meta-author">${design.type}</span>
        </div>`;
    return slide;
}

function moveSlide(dir) {
    if (isTransitioning) return;
    const slides = document.querySelectorAll('.slide');
    if (currentIndex <= 0 && dir === -1) return;
    if (currentIndex >= slides.length - 1 && dir === 1) return;

    isTransitioning = true;
    track.style.transition = "transform 0.4s ease-in-out";
    currentIndex += dir;
    track.style.transform = `translateX(${-100 * currentIndex}%)`;
}

function handleTransitionEnd() {
    isTransitioning = false;
    const slides = document.querySelectorAll('.slide');

    if (slides[currentIndex].id === 'lastClone') {
        track.style.transition = 'none';
        currentIndex = slides.length - 2;
        track.style.transform = `translateX(${-100 * currentIndex}%)`;
    } else if (slides[currentIndex].id === 'firstClone') {
        track.style.transition = 'none';
        currentIndex = 1;
        track.style.transform = `translateX(${-100 * currentIndex}%)`;
    }
}

function getRealDataIndex() {
    const el = document.querySelectorAll('.slide')[currentIndex];
    return el?.dataset.realIndex ? parseInt(el.dataset.realIndex) : 0;
}

function goToPage(num) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.replace('visible', 'hidden') || p.classList.add('hidden');
    });
    document.getElementById(`page${num}`)?.classList.replace('hidden', 'visible');
}

function submitDesign() {
    const message = document.getElementById("messageInput").value.trim();
    if (!message) return alert("Silakan masukkan nama Anda terlebih dahulu!");
    
    const lowerMessage = message.toLowerCase();
    if (badWords.some(w => lowerMessage.includes(w))) {
        return alert("Maaf, nama mengandung kata yang tidak pantas!");
    }

    const design = designs[getRealDataIndex()];
    document.getElementById("confirmImage").src = design.src;
    document.getElementById("confirmText").innerText = message;
    goToPage(3);
}

// Perbaikan: mengirim design.name & design.type ke Firebase
function launchPostcard() {
    const btn = document.getElementById("btnLaunch");
    btn.innerText = "SENDING...";
    btn.disabled = true;
    btn.style.opacity = "0.6";

    const design = designs[getRealDataIndex()];
    sendPostcardData({
        designTitle: design.name,
        designType: design.type,
        designImage: design.src,
        message: document.getElementById("confirmText").innerText,
        timestamp: Date.now()
    }).then(() => {
        goToPage(4);
    }).catch(err => {
        console.error("Firebase Error:", err);
        alert("Gagal mengirim data. Periksa koneksi internet Anda.");
    }).finally(() => {
        btn.innerText = "LAUNCH";
        btn.disabled = false;
        btn.style.opacity = "1";
    });
}

// Reset all state and return to home
function resetApp() {
    document.getElementById('messageInput').value = "";
    document.getElementById('charCount').innerText = "0";
    track.style.transition = 'none';
    currentIndex = 1;
    track.style.transform = `translateX(-100%)`;
    goToPage(1);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    loadBadWords();
    initCarousel();

    document.getElementById("messageInput").addEventListener("input", e => {
        document.getElementById("charCount").innerText = e.target.value.length;
    });

    track.addEventListener('transitionend', handleTransitionEnd);

    Object.assign(window, { moveSlide, goToPage, submitDesign, launchPostcard, resetApp });
});