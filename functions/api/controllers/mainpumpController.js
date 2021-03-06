'use strict';

var async = require('async');
var moment = require('moment');
const uuidv1 = require('uuid/v1');
var admin = require("firebase-admin");
var db = admin.database();

var ThingSpeakClient = require('thingspeakclient');

function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.id = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

exports.list_all_mainpumps = function(req, res){
  var ref = db.ref('/mainpump');
  ref.once('value', function(snapshot) {
    var obj = snapshotToArray(snapshot);
    //console.log("Mainpump list => " + JSON.stringify(obj) + " with size of " + obj.length);
    res.render('dashboard/farm/list_mainpump.ejs', {mainpumps: obj});
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};

exports.create_a_mainpump = function(req, res){
  var mainpumpClient = new ThingSpeakClient();
  var mainpump_id = req.body.add_mainpump_id;
  var mainpump_description = req.body.add_mainpump_description;
  var mainpump_write_api_key = req.body.add_mainpump_write_api_key;
  var mainpump_sampling_time = req.body.add_mainpump_sampling_time;
  console.log('Mainpump id = ' + mainpump_id + ", key = " + mainpump_write_api_key);
  /*var ref = db.ref('/mainpump/' + pump_id).set({
    write_api_key: write_api_key
  });*/
    var ref = db.ref('/mainpump').child(mainpump_id).set({
      description: mainpump_description,
      write_api_key: mainpump_write_api_key,
      sampling_time: mainpump_sampling_time,
      activated: 'false',
      entry_id: "-",
      field1: "-",
      field2: "-",
      field3: "-",
      field4: "-",
      field5: "-",
      field6: "-",
      field7: "-",
      field8: "-",
      created_at: "-"
    });
  res.redirect('mainpump');
};

exports.edit_a_mainpump = function(req, res){
  var mainpump_id = req.body.edit_mainpump_id;
  var mainpump_description = req.body.edit_mainpump_description;
  var mainpump_write_api_key = req.body.edit_mainpump_write_api_key;
  var mainpump_sampling_time = req.body.edit_mainpump_sampling_time;
  console.log('mainpump id = ' + mainpump_id + ", write_api_key = " + mainpump_write_api_key);
  var ref = db.ref('/mainpump').child(mainpump_id).update({
    description: mainpump_description,
    write_api_key: mainpump_write_api_key,
    sampling_time: mainpump_sampling_time,
    activated: 'false'
  });
  res.redirect('../mainpump');
};

exports.delete_a_mainpump = function(req, res){
  var mainpump_id = req.body.delete_mainpump_id;
  console.log("Delete mainpump => " + mainpump_id);
  var ref = db.ref('/mainpump/'+mainpump_id).remove();
  res.redirect('../mainpump');
};

exports.delete_a_mainpump_id = function(req, res){
  var mainpump_id = req.params.id;
  console.log("Delete mainpump by id => " + mainpump_id);
  var ref = db.ref('/mainpump/'+mainpump_id).remove(function(err){
    if(err)
      return res.send();
    res.redirect('../../mainpump');
  });
};

exports.activate_mainpump = function(req, res){
  var mainpumpClient = new ThingSpeakClient();
  var mainpump_id = req.params.id;
  var mainpump_sampling_time;
  var count = 0;
  var ref = db.ref('/mainpump/'+mainpump_id);
  ref.once('value', function(snapshot) {
    var obj = JSON.parse(JSON.stringify(snapshot));
    mainpump_sampling_time = parseInt(obj.sampling_time)*60000;
    ref.update({
      activated: 'true'
    });
    console.log("mainpump activated => " + obj.activated + " with sampling time => " + mainpump_sampling_time.toString() + " millisecs...");
    var mainpumpThingspeakIntervalId = setInterval(function(){
        // Attach an asynchronous callback to read the data at our posts reference
        /*ref.on("value", function(snapshot) {
          console.log(snapshot.val());
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        }); */
        var ref2 = db.ref('/mainpump/'+mainpump_id);
        ref2.once('value', function(snapshot) {
          var obj = JSON.parse(JSON.stringify(snapshot));
          console.log("[setInterval] mainpump activated => " + obj.activated);
          if(obj.activated == 'false')
            {
              count = 0;
              console.log("mainpump[" + mainpump_id + "] deactivated.");
              clearInterval(mainpumpThingspeakIntervalId);
              return true;
            }
          }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        count++;
        console.log("Reading feed from thingspeak by => " + mainpump_id + " with count => " + count);
        mainpumpClient.getLastEntryInChannelFeed(parseInt(mainpump_id), {}, function(err, resp){
        var ts_json = JSON.stringify(resp);
        console.log("Data from mainpump[" + mainpump_id + "] => " + ts_json);
        if(typeof resp.entry_id !== 'undefined')
        {
          db.ref('/mainpump').child(mainpump_id).update(resp);
  /*          last_entry_id: resp.entry_id,
            last_entry_field1: resp.field1,
            last_entry_field2: resp.field2,
            last_entry_field3: resp.field3,
            last_entry_field4: resp.field4,
            last_entry_field5: resp.field5,
            last_entry_field6: resp.field6,
            last_entry_field7: resp.field7,
            last_entry_field8: resp.field8,
            last_entry_created_at: resp.created_at*/
          //);
        };
        return true;
        });
      }, mainpump_sampling_time);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });

  res.redirect('../../mainpump');
};

exports.deactivate_mainpump = function(req, res){
  var mainpump_id = req.params.id;
  console.log("Deactivating mainpump[" + mainpump_id + "]...");
  var ref = db.ref('/mainpump/'+mainpump_id);
  ref.once('value', function(snapshot) {
    //var obj = JSON.parse(JSON.stringify(snapshot));
    ref.update({
      activated: 'false'
    });
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
  res.redirect('../../mainpump');
};

exports.turnon_mainpump = function(req, res){
  var mainpump_id = req.params.id;
  var mainpump_write_api_key = req.params.key;
  var mainpump_field = req.params.field;
  console.log("Field => " + mainpump_field);
  var mainpumpClient = new ThingSpeakClient();
  mainpumpClient.getLastEntryInChannelFeed(parseInt(mainpump_id), {}, function(err, resp){
    //console.log("Reading last entry in channel feed => " + JSON.stringify(resp));
    if(!err && resp.entry_id > 0)
    {
      switch(mainpump_field){
        case '1':
          resp.field1 = 1;
          break;
        case '2':
          resp.field2 = 1;
          break;
        case '3':
          resp.field3 = 1;
          break;
        case '4':
          resp.field4 = 1;
          break;
        case '5':
          resp.field5 = 1;
          break;
        case '6':
          resp.field6 = 1;
          break;
        case '7':
          resp.field7 = 1;
          break;
        case '8':
          resp.field8 = 1;
          break;
      }
      console.log("Updating mainpump[" + mainpump_id + "] with => " + JSON.stringify(resp) + " & key => " + mainpump_write_api_key);
      mainpumpClient.attachChannel(parseInt(mainpump_id),{writeKey: mainpump_write_api_key});
      mainpumpClient.updateChannel(parseInt(mainpump_id), resp, function(err, resp){
        if(!err && resp > 0)
        {
          db.ref('/mainpump').child(mainpump_id).update({status: '1'},function(err){
          console.log("Turning on mainpump[" + mainpump_id + "] is done successfully...");
          });
        }
        else {
          console.log("Turning on mainpump[" + mainpump_id + "] failed...");
        }
        res.send(resp);
      });
    }
    else {
      res.send("Error with " + JSON.stringify(resp));
    }
  });
};

exports.turnoff_mainpump = function(req, res){
  var mainpump_id = req.params.id;
  var mainpump_write_api_key = req.params.key;
  var mainpump_field = req.params.field;
  console.log("Field => " + mainpump_field);
  var mainpumpClient = new ThingSpeakClient();
  mainpumpClient.getLastEntryInChannelFeed(parseInt(mainpump_id), {}, function(err, resp){
    if(!err && resp.entry_id > 0){
      switch(mainpump_field){
        case '1':
          resp.field1 = -1;
          break;
        case '2':
          resp.field2 = -1;
          break;
        case '3':
          resp.field3 = -1;
          break;
        case '4':
          resp.field4 = -1;
          break;
        case '5':
          resp.field5 = -1;
          break;
        case '6':
          resp.field6 = -1;
          break;
        case '7':
          resp.field7 = -1;
          break;
        case '8':
          resp.field8 = -1;
          break;
      }
      console.log("Updating mainpump[" + mainpump_id + "] with => " + JSON.stringify(resp) + " & key => " + mainpump_write_api_key);
      mainpumpClient.attachChannel(parseInt(mainpump_id), {writeKey: mainpump_write_api_key});
      mainpumpClient.updateChannel(parseInt(mainpump_id), resp, function(err, resp){
        if(!err && resp > 0)
        {
          db.ref('/mainpump').child(mainpump_id).update({status: '1'},function(err){
            console.log("Turning off mainpump[" + mainpump_id + "] is done successfully...");
          });
        }
        else {
          console.log("Turning off mainpump[" + mainpump_id + "] failed...");
        }
        res.send(resp);
      });
    }
    else {
      res.send(resp);
    }
  });
};
