import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Initialize Firebase services
const db = getDatabase();
const auth = getAuth();

// Function to fetch and display incoming pairing requests
function fetchPairingRequests() {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        get(userRef)
            .then((snapshot) => {
                const userData = snapshot.val();
                const requests = userData.pairingRequests || [];
                displayRequests(requests);
            })
            .catch((error) => {
                console.error("Error fetching pairing requests:", error.message);
            });
    }
}

// Function to display pairing requests
function displayRequests(requests) {
    const requestsDiv = document.getElementById("pairingRequests");
    requestsDiv.innerHTML = ""; // Clear previous requests

    if (requests.length > 0) {
        requests.forEach(requestId => {
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("request");
            requestDiv.innerHTML = `
                <p>Request from user ID: ${requestId}</p>
                <button onclick="approvePairingRequest('${requestId}')">Approve</button>
                <button onclick="rejectPairingRequest('${requestId}')">Reject</button>
            `;
            requestsDiv.appendChild(requestDiv);
        });
    } else {
        requestsDiv.innerHTML = "<p>No pairing requests found.</p>";
    }
}

// Function to approve pairing request
function approvePairingRequest(requestId) {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const targetUserRef = ref(db, 'users/' + requestId);

        // Update current user's data
        get(userRef)
            .then((snapshot) => {
                const currentUserData = snapshot.val();
                currentUserData.pairingRequests = currentUserData.pairingRequests.filter(id => id !== requestId);
                currentUserData.pairedWith = requestId;

                // Save updated current user data
                set(userRef, currentUserData);

                // Update target user's data
                get(targetUserRef)
                    .then((snapshot) => {
                        const targetUserData = snapshot.val();
                        targetUserData.pairedWith = currentUser.uid;

                        // Save updated target user data
                        set(targetUserRef, targetUserData);

                        alert("Pairing request approved!");
                        fetchPairingRequests(); // Refresh requests list
                    });
            })
            .catch((error) => {
                console.error("Error approving pairing request:", error.message);
            });
    }
}

// Function to reject pairing request
function rejectPairingRequest(requestId) {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);

        get(userRef)
            .then((snapshot) => {
                const currentUserData = snapshot.val();
                currentUserData.pairingRequests = currentUserData.pairingRequests.filter(id => id !== requestId);

                // Save updated current user data
                set(userRef, currentUserData);

                alert("Pairing request rejected!");
                fetchPairingRequests(); // Refresh requests list
            })
            .catch((error) => {
                console.error("Error rejecting pairing request:", error.message);
            });
    }
}

// Fetch pairing requests when the page loads
window.onload = fetchPairingRequests;
