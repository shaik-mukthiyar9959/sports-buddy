document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
  
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
  
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const uid = userCredential.user.uid;
  
            firebase.firestore().collection("users").doc(uid).get()
              .then(doc => {
                if (doc.exists && doc.data().role === "admin") {
                  window.location.href = "admin-dashboard.html";
                } else {
                  alert("Access denied: Not an admin.");
                  firebase.auth().signOut();
                }
              });
          })
          .catch((error) => {
            alert("Login failed: " + error.message);
          });
      });
    }
  });
  