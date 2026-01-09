const firebaseConfig = {
    apiKey: "AIzaSyDVEb3kJsFTNW0rRYm9FJkxH_PcMjs3UNY",
    authDomain: "agendamidia-f94b5.firebaseapp.com",
    projectId: "agendamidia-f94b5",
    storageBucket: "agendamidia-f94b5.firebasestorage.app",
    messagingSenderId: "768039935772",
    appId: "1:768039935772:web:d69e874884f5ea6d6da4d9"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


{/* <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDVEb3kJsFTNW0rRYm9FJkxH_PcMjs3UNY",
    authDomain: "agendamidia-f94b5.firebaseapp.com",
    projectId: "agendamidia-f94b5",
    storageBucket: "agendamidia-f94b5.firebasestorage.app",
    messagingSenderId: "768039935772",
    appId: "1:768039935772:web:d69e874884f5ea6d6da4d9"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> */}