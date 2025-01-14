import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuwbFf4v05VzuNu84YCS9S31pV9cOYktw",
  authDomain: "ocean-35959.firebaseapp.com",
  projectId: "ocean-35959",
  storageBucket: "ocean-35959.firebasestorage.app",
  messagingSenderId: "926712216319",
  appId: "1:926712216319:web:ac2a5ffc6fb5b56447eaca",
  measurementId: "G-J844DFXM0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value; // Get the username from the input field

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firebase Realtime Database
    const userRef = ref(db, 'users/' + user.uid);
    await set(userRef, {
      username: username, // Store the username
      email: user.email,
      pairingRequests: [],
      pairedWith: null
    });

    // Redirect to pairing page after successful signup
    window.location.href = "user_pairing/pairing.html";
  } catch (error) {
    console.error("Error signing up:", error.message);
    alert(error.message);
  }
});
