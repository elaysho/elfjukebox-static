// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDaIEFQwueqjkczaJ3hg6lXiwBJ02tv_rE",
    authDomain: "elfjukebox.firebaseapp.com",
    projectId: "elfjukebox",
    storageBucket: "elfjukebox.appspot.com",
    messagingSenderId: "424551296014",
    appId: "1:424551296014:web:1d7c38892f59977018a05f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase SDK's
var db = firebase.firestore();