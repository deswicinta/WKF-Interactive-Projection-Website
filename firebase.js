import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBVOw2Mn-J573QJ6hM2xjt6bAOq5OTZq_w",
    authDomain: "wahana-flora-malang.firebaseapp.com",
    databaseURL: "https://wahana-flora-malang-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wahana-flora-malang",
    storageBucket: "wahana-flora-malang.firebasestorage.app",
    messagingSenderId: "764313028616",
    appId: "1:764313028616:web:235c90626e8532036129bd",
    measurementId: "G-J55HEVXZXY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function sendPostcardData(data) {
    return push(ref(db, 'messages'), data);
}