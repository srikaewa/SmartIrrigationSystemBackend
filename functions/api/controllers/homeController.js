var admin = require("firebase-admin");
var serviceAccount = require("../../keys/smart-irrigation-system-191707-firebase-adminsdk-c7t3e-a8a06b3f35.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-irrigation-system-191707.firebaseio.com"
});

exports.dashboard = function(req, res) {
  res.render('dashboard/index.ejs', {});
}
