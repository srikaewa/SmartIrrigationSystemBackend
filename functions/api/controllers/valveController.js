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

exports.list_all_valves = function(req, res){
  var ref = db.ref('/valve');
  ref.once('value', function(snapshot) {
    var obj = snapshotToArray(snapshot);
    console.log("Valve list => " + JSON.stringify(obj) + " with size of " + obj.length);
    res.render('dashboard/farm/list_valve.ejs', {valves: obj});
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};

exports.create_a_valve = function(req, res){
  var valveClient = new ThingSpeakClient();
  var valve_id = req.body.add_valve_id;
  var valve_description = req.body.add_valve_description;
  var valve_write_api_key = req.body.add_valve_write_api_key;
  var valve_sampling_time = (req.body.add_valve_sampling_time==null||req.body.add_valve_sampling_time==""? 5 : req.body.add_valve_sampling_time);
  console.log('valve id = ' + valve_id + ", key = " + valve_write_api_key + ", sampling time = " + valve_sampling_time);
  /*var ref = db.ref('/valve/' + pump_id).set({
    write_api_key: write_api_key
  });*/
    var ref = db.ref('/valve').child(valve_id).set({
      description: valve_description,
      write_api_key: valve_write_api_key,
      sampling_time: valve_sampling_time,
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
  res.redirect('valve')
};

exports.edit_a_valve = function(req, res){
  var valve_id = req.body.edit_valve_id;
  var valve_description = req.body.edit_valve_description;
  var valve_write_api_key = req.body.edit_valve_write_api_key;
  var valve_sampling_time = req.body.edit_valve_sampling_time;
  console.log('valve id = ' + valve_id + ", write_api_key = " + valve_write_api_key);
  var ref = db.ref('/valve').child(valve_id).update({
    description: valve_description,
    write_api_key: valve_write_api_key,
    sampling_time: valve_sampling_time,
    activated: 'false'
  });
  res.redirect('../valve');
};

exports.delete_a_valve = function(req, res){
  var valve_id = req.body.delete_valve_id;
  console.log("Delete valve => " + valve_id);
  var ref = db.ref('/valve/'+valve_id).remove();
  res.redirect('../valve');
};

exports.delete_a_valve_id = function(req, res){
  var valve_id = req.params.id;
  console.log("Delete valve by id => " + valve_id);
  var ref = db.ref('/valve/'+valve_id).remove(function(err){
    if(err)
      return res.send();
    res.redirect('../../valve');
  });
};

exports.activate_valve = function(req, res){
  var valveClient = new ThingSpeakClient();
  var valve_id = req.params.id;
  var count = 0;
  var ref = db.ref('/valve/'+valve_id);
  ref.once('value', function(snapshot) {
    var obj = JSON.parse(JSON.stringify(snapshot));
    ref.update({
      activated: 'true'
    });
    console.log("valve activated => " + obj.activated);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });

  var valveThingspeakIntervalId = setInterval(function(){
      // Attach an asynchronous callback to read the data at our posts reference
      /*ref.on("value", function(snapshot) {
        console.log(snapshot.val());
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }); */
      var ref2 = db.ref('/valve/'+valve_id);
      ref2.once('value', function(snapshot) {
        var obj = JSON.parse(JSON.stringify(snapshot));
        console.log("[setInterval] valve activated => " + obj.activated);
        if(obj.activated == 'false')
          {
            count = 0;
            clearInterval(valveThingspeakIntervalId);
          }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
      });
      count++;
      console.log("Reading feed from thingspeak by => " + valve_id + " with count => " + count);
      valveClient.getLastEntryInChannelFeed(parseInt(valve_id), {}, function(err, resp){
      var ts_json = JSON.stringify(resp);
      console.log("Data from valve[" + valve_id + "] => " + ts_json);
      if(typeof resp.entry_id !== 'undefined')
      {
        db.ref('/valve').child(valve_id).update(resp);
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
        }
      });
      }, 30000);
      res.redirect('../../valve');
};

exports.deactivate_valve = function(req, res){
  var valve_id = req.params.id;
  var ref = db.ref('/valve/'+valve_id);
  ref.once('value', function(snapshot) {
    var obj = JSON.parse(JSON.stringify(snapshot));
    ref.update({
      activated: 'false'
    });
    console.log("valve activated => " + obj.activated);
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });
  res.redirect('../../valve');
};

exports.turnon_valve = function(req, res){
  var valve_id = req.params.id;
  var valve_write_api_key = req.params.key;
  var valve_field = req.params.field;
  console.log("Field => " + valve_field);
  var valveClient = new ThingSpeakClient();
  valveClient.getLastEntryInChannelFeed(parseInt(valve_id), {}, function(err, resp){
    //console.log("Reading last entry in channel feed => " + JSON.stringify(resp));
    if(!err && resp.entry_id > 0)
    {
      switch(valve_field){
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
      console.log("Updating valve[" + valve_id + "] with => " + JSON.stringify(resp) + " & key => " + valve_write_api_key);
      valveClient.attachChannel(parseInt(valve_id),{writeKey: valve_write_api_key});
      valveClient.updateChannel(parseInt(valve_id), resp, function(err, resp){
        if(!err && resp > 0)
        {
          db.ref('/valve').child(valve_id).update({status: '1'},function(err){
          console.log("Turning on valve[" + valve_id + "] is done successfully...");
          });
        }
        else {
          console.log("Turning on valve[" + valve_id + "] failed...");
        }
        res.send(resp);
      });
    }
    else {
      res.send("Error with " + JSON.stringify(resp));
    }
  });
};

exports.turnoff_valve = function(req, res){
  var valve_id = req.params.id;
  var valve_write_api_key = req.params.key;
  var valve_field = req.params.field;
  console.log("Field => " + valve_field);
  var valveClient = new ThingSpeakClient();
  valveClient.getLastEntryInChannelFeed(parseInt(valve_id), {}, function(err, resp){
    if(!err && resp.entry_id > 0){
      switch(valve_field){
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
      console.log("Updating valve[" + valve_id + "] with => " + JSON.stringify(resp) + " & key => " + valve_write_api_key);
      valveClient.attachChannel(parseInt(valve_id), {writeKey: valve_write_api_key});
      valveClient.updateChannel(parseInt(valve_id), resp, function(err, resp){
        if(!err && resp > 0)
        {
          db.ref('/valve').child(valve_id).update({status: '1'},function(err){
            console.log("Turning off valve[" + valve_id + "] is done successfully...");
          });
        }
        else {
          console.log("Turning off valve[" + valve_id + "] failed...");
        }
        res.send(resp);
      });
    }
    else {
      res.send(resp);
    }
  });
};
