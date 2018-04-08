// db.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://irri:irri@ds111568.mlab.com:11568/irridb');
console.log('Mongodb connected...');
