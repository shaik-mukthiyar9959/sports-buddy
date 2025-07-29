firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  document.getElementById("userEmail").textContent = user.email;

  const eventForm = document.getElementById("eventForm");
  const eventList = document.getElementById("event-list");
  const logoutBtn = document.getElementById("logoutBtn");

  // Add Event
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const sport = document.getElementById("sportName").value.trim();
    const location = document.getElementById("location").value.trim();
    const date = document.getElementById("eventDate").value;

    if (!sport || !location || !date) {
      alert("Please fill in all fields.");
      return;
    }

    firebase.firestore().collection("events").add({
      sport,
      location,
      date,
      createdBy: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).then(() => {
      alert("Event added!");
      eventForm.reset();
      loadEvents();
    }).catch((err) => {
      console.error("Add error:", err);
    });
  });

  // Load Events
  function loadEvents() {
    eventList.innerHTML = "";

    firebase.firestore().collection("events")
      .where("createdBy", "==", userId)
      .orderBy("createdAt", "desc")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const event = doc.data();
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${event.sport}</strong> at ${event.location} on ${event.date}
            <button onclick="editEvent('${doc.id}', '${event.sport}', '${event.location}', '${event.date}')">Edit</button>
            <button onclick="deleteEvent('${doc.id}')">Delete</button>
          `;
          eventList.appendChild(li);
        });
      }).catch((err) => {
        console.error("Load error:", err);
      });
  }

  // Initial load
  loadEvents();

  // Logout
  logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    });
  });
});

// Delete Event
function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event?")) {
    firebase.firestore().collection("events").doc(eventId).delete()
      .then(() => {
        alert("Event deleted.");
        location.reload();
      })
      .catch((err) => {
        alert("Delete failed: " + err.message);
      });
  }
}

// Edit Event
function editEvent(id, sport, location, date) {
  const newSport = prompt("Update Sport Name:", sport);
  const newLocation = prompt("Update Location:", location);
  const newDate = prompt("Update Date (YYYY-MM-DD):", date);

  if (newSport && newLocation && newDate) {
    firebase.firestore().collection("events").doc(id).update({
      sport: newSport,
      location: newLocation,
      date: newDate,
    }).then(() => {
      alert("Event updated.");
      location.reload();
    }).catch((err) => {
      alert("Update failed: " + err.message);
    });
  }
}
