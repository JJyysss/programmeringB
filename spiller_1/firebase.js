

// oplysninger om database
const firebaseConfig = {
  // en nøgle, der identificerer  Firebase-projekt og giver adgang
    apiKey: "AIzaSyDGhOFQU6Z6-Ogim2gpqyYzGtXwkVcj0N4",
    // webadresse til projektets login-tjeneste
    authDomain: "riddlees.firebaseapp.com",
    // navnet på projektets database
    projectId: "riddlees",
    // til billeder og filer, der gemt i Firebase
    storageBucket: "riddlees.firebasestorage.app",
    // Unikker ID for projektet
    messagingSenderId: "266185442313",
    appId: "1:266185442313:web:398b25a3059c22638024d8",
    // til google analytics
    measurementId: "G-SGEGK0ZL5E"
  };
  
  
   // Initialize Firebase
   // start forbindelse til databasen med de oplysninger, der er givet i firebaseConfig
    const app = firebase.initializeApp(firebaseConfig);
    // forbinde til Firstore-databasen
    // klar til at bruge databasen og hente ting fra den
    const database = firebase.firestore()
    
    
    