import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

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

// Function to fetch and display incoming pairing requests
function fetchPairingRequests() {
    const requestsDiv = document.getElementById("pairingRequests");
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        requestsDiv.innerHTML = "<p>Please log in to view requests.</p>";
        return;
    }

    const userRef = ref(db, 'users/' + currentUser.uid);
    get(userRef)
        .then((snapshot) => {
            const userData = snapshot.val();
            if (!userData) {
                requestsDiv.innerHTML = "<p>No user data found.</p>";
                return;
            }
            const requests = userData.pairingRequests || [];
            displayRequests(requests);
        })
        .catch((error) => {
            console.error("Error fetching pairing requests:", error);
            requestsDiv.innerHTML = "<p>Error loading requests. Please try again.</p>";
        });
}

// Function to display pairing requests
async function displayRequests(requests) {
    const requestsDiv = document.getElementById("pairingRequests");
    requestsDiv.innerHTML = ""; // Clear previous requests

    if (requests.length === 0) {
        requestsDiv.innerHTML = "<p>No pairing requests found.</p>";
        return;
    }

    for (const requestId of requests) {
        try {
            const userRef = ref(db, 'users/' + requestId);
            const snapshot = await get(userRef);
            const userData = snapshot.val();
            
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("request");
            requestDiv.innerHTML = `
                <p>Request from: ${userData.username || 'Unknown User'}</p>
                <p>User ID: ${userData.code || requestId}</p>
                <button onclick="handlePairingRequest('${requestId}', 'approve')">Approve</button>
                <button onclick="handlePairingRequest('${requestId}', 'reject')">Reject</button>
            `;
            requestsDiv.appendChild(requestDiv);
        } catch (error) {
            console.error("Error fetching requester data:", error);
        }
    }
}

// Handler function for pairing requests
async function handlePairingRequest(requestId, action) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        // Remove request from the array
        userData.pairingRequests = (userData.pairingRequests || []).filter(id => id !== requestId);

        if (action === 'approve') {
            // Update current user's paired status
            userData.pairedWith = requestId;

            // Update target user's paired status
            const targetUserRef = ref(db, 'users/' + requestId);
            const targetSnapshot = await get(targetUserRef);
            const targetUserData = targetSnapshot.val();
            targetUserData.pairedWith = currentUser.uid;

            await set(targetUserRef, targetUserData);
            alert("Pairing request approved!");
        } else {
            alert("Pairing request rejected!");
        }

        await set(userRef, userData);
        fetchPairingRequests(); // Refresh the requests list
    } catch (error) {
        console.error(`Error ${action}ing pairing request:`, error);
        alert(`Error ${action}ing request. Please try again.`);
    }
}

// Make handlePairingRequest available globally
window.handlePairingRequest = handlePairingRequest;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchPairingRequests();
    } else {
        document.getElementById("pairingRequests").innerHTML = "<p>Please log in to view requests.</p>";
    }
});