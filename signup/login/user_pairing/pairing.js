// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

// Load the user's unique ID
function loadUserId() {
    const currentUser = auth.currentUser;
    const userIdElement = document.getElementById("userId");

    if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        get(userRef)
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.code) {
                    userIdElement.textContent = userData.code;
                } else {
                    userIdElement.textContent = "No ID found.";
                }
            })
            .catch(error => {
                console.error("Error fetching user ID:", error.message);
                userIdElement.textContent = "Error loading ID.";
            });
    } else {
        userIdElement.textContent = "User not logged in.";
    }
}

// Copy the user's unique ID to the clipboard
function copyUserId() {
    const userId = document.getElementById("userId").textContent;
    if (userId && userId !== "Loading..." && userId !== "No ID found.") {
        navigator.clipboard.writeText(userId).then(() => {
            alert("ID copied to clipboard!");
        });
    } else {
        alert("No ID available to copy.");
    }
}

// Send a pairing request to the entered ID
function sendPairingRequest() {
    const enteredId = document.getElementById("searchIdInput").value.trim();
    const currentUser = auth.currentUser;

    if (!enteredId) {
        alert("Please enter an ID.");
        return;
    }

    if (currentUser) {
        const usersRef = ref(db, 'users/');
        get(usersRef)
            .then(snapshot => {
                const users = snapshot.val();
                let targetUser = null;

                // Find the user with the entered ID
                for (const userId in users) {
                    if (users[userId].code === enteredId) {
                        targetUser = { id: userId, ...users[userId] };
                        break;
                    }
                }

                if (targetUser) {
                    // Add pairing request to target user
                    const targetUserRef = ref(db, 'users/' + targetUser.id);
                    const targetRequests = targetUser.pairingRequests || [];
                    if (!targetRequests.includes(currentUser.uid)) {
                        targetRequests.push(currentUser.uid);
                        update(targetUserRef, { pairingRequests: targetRequests })
                            .then(() => alert("Pairing request sent!"))
                            .catch(error => console.error("Error sending request:", error.message));
                    } else {
                        alert("Request already sent.");
                    }
                } else {
                    alert("No user found with the entered ID.");
                }
            })
            .catch(error => console.error("Error searching for user:", error.message));
    } else {
        alert("User not logged in.");
    }
}

// Add event listeners
onAuthStateChanged(auth, user => {
    if (user) {
        loadUserId();
    } else {
        document.getElementById("userId").textContent = "Please log in.";
    }
});

document.getElementById("copyIdButton").addEventListener("click", copyUserId);
document.getElementById("sendRequestButton").addEventListener("click", sendPairingRequest);
