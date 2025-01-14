import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js';

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

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user data from Firebase Realtime Database
    const userRef = ref(db, 'users/' + user.uid);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      console.log('Logged in user data:', userData);

      // Store username in localStorage for later use
      localStorage.setItem('username', userData.username);

      // Redirect to pairing page after successful login
      window.location.href = "user_pairing/pairing.html"; // Correct path to pairing page
    } else {
      console.log("No user data found.");
      alert("No user data found.");
    }
  } catch (error) {
    console.error("Error logging in:", error.message);
    alert(error.message);
  }
});
