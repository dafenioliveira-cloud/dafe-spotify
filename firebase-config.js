import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyC0YvCoeRdDCTuhk4jHMPq5GHGpkKY4qFA",
  authDomain: "dafe-spotify.firebaseapp.com",
  databaseURL: "https://dafe-spotify-default-rtdb.firebaseio.com", 
  projectId: "dafe-spotify",
  storageBucket: "dafe-spotify.firebasestorage.app",
  messagingSenderId: "178024870650",
  appId: "1:178024870650:web:4bac901555d9f5afef0f43",
  measurementId: "G-9QEZZ9B70Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const refMusicas = ref(db, "musicas");