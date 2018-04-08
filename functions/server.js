// server.js
var app = require('./app');
var firebase = require('firebase');

// Initialize Firebase
var config = {
    apiKey: "AIzaSyC65bubvLtPfHpJAab4FO102ChQBY3CrJc",
    authDomain: "smart-irrigation-system-191707.firebaseapp.com",
    databaseURL: "https://smart-irrigation-system-191707.firebaseio.com",
    projectId: "smart-irrigation-system-191707",
    storageBucket: "smart-irrigation-system-191707.appspot.com",
    messagingSenderId: "973156090960"
};
firebase.initializeApp(config);

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log('Smart Irrigation System server listening on port ' + port);
});
