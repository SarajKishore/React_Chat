import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
    apiKey: "AIzaSyCmy7HZ589lb__W-W1xFSoe_PhUGzCuMy4",
    authDomain: "react-chat-4277e.firebaseapp.com",
    databaseURL: "https://react-chat-4277e.firebaseio.com",
    projectId: "react-chat-4277e",
    storageBucket: "react-chat-4277e.appspot.com",
    messagingSenderId: "129156498174",
    appId: "1:129156498174:web:6f7ee21bb079286ef49baf",
    measurementId: "G-LQ59J6M676"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // firebase.analytics();

  export default firebase;