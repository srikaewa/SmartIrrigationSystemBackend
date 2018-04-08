'use strict';

var async = require('async');
var moment = require('moment');
const uuidv1 = require('uuid/v1');
var admin = require("firebase-admin");

var userList = [];

function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.id = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

function snapshotToArray2(snapshot, type) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        if(item.watering_scheme == type)
        {
          item.id = childSnapshot.key;
          returnArr.push(item);
        }
    });

    return returnArr;
};


// Get a reference to the database service
var db = admin.database();

exports.list_all_users = function(req, res){

  function listAllUsers(nextPageToken) {
   // List batch of users, 1000 at a time.
     admin.auth().listUsers(1000, nextPageToken)
       .then(function(listUsersResult) {
         console.log("listUsersResult2 length => ", Object.keys(listUsersResult).length);
         /*userList.length = 0;
         listUsersResult.users.forEach(function(userRecord) {
           userList.push({
             uid : userRecord.uid,
             email : userRecord.email,
             displayName : userRecord.displayName,
             photoURL : userRecord.photoURL
           });*/
           //console.log("User list ... " + userList.length);
         //});
           //console.log("user added => ", userList[userList.length - 1]);
           //res.status(200).send("Number of user => ", Object.keys(listUsersResult).length);

         if (listUsersResult.pageToken) {
           // List next batch of users.
           console.log("user", listUsersResult.users);
           res.render('dashboard/user/list_user.ejs',{users: listUsersResult.users});
           listAllUsers(listUsersResult.pageToken);
           //console.log("listUsersResult3 length => ", Object.keys(listUsersResult).length);
         }
         //resolve(Object.keys(listUsersResult).length);
       })
       .catch(function(error) {
         console.log("Error listing users:", error);
         //reject(Object.keys(listUsersResult).length);
       });
   };

  listAllUsers();
};

exports.create_a_user = function(req, res){

};

function findSoilObject(id)
{
  var ref = db.ref('/soil');
  ref.once('value', function(snapshot){
    var obj2 = JSON.parse(JSON.stringify(snapshot));
    var idObj2 = Object.keys(obj2);
    var soils = idObj2.map(function (key) {
      return obj2[key];
    });
    var i = 0;
    soils.forEach(function(s){
      console.log("compare soil id => " + id + " with " + idObj2[i]);
      if(idObj2[i] == id)
      {
            console.log("found one!!!!!!!!!!!!!!!");
            s.id = id;
            return s;
      }
      i++;
    });
  });
}

function findPlantObject(id)
{
  var ref = db.ref('/plant');
  ref.once('value', function(snapshot){
    var obj2 = JSON.parse(JSON.stringify(snapshot));
    var idObj2 = Object.keys(obj2);
    var soils = idObj2.map(function (key) {
      return obj2[key];
    });
    var ss;
    var i = 0;
    soils.forEach(function(s){
      if(idObj2[i] == id)
      {
            s.id = id;
            return s;
      }
      i++;
    });
  });
}

exports.list_all_farm = function(req, res) {
  var ref = db.ref('/farm');
  ref.once('value', function(snapshot) {
    var obj = snapshotToArray(snapshot);
    //console.log("Mainpump list => " + JSON.stringify(obj) + " with size of " + obj.length);
    //console.log("farms..............", obj);
    res.render('dashboard/farm/list_farm.ejs', {farms: obj});
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};

exports.list_all_farm_type = function(req, res) {
  var farm_type = req.params.type;
  var ref = db.ref('/farm');
  ref.once('value', function(snapshot) {
    var obj = snapshotToArray2(snapshot, farm_type);
    //console.log("Mainpump list => " + JSON.stringify(obj) + " with size of " + obj.length);
    //console.log("farms..............", obj);
    if(farm_type == 1)
    {
      res.render('dashboard/farm/list_farm_sensor.ejs', {farms: obj});
    }else if(farm_type == 2)
    {
      res.render('dashboard/farm/list_farm_drip.ejs', {farms: obj});
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};


exports.new_farm = function(req, res) {
  var ref = db.ref('/soil');
  ref.once('value', function(snapshot){
    var obj2 = JSON.parse(JSON.stringify(snapshot));
    var idObj2 = Object.keys(obj2);
    var soils = [];
    for(var i=0;i<idObj2.length;i++)
    {
      soils.push(obj2[idObj2[i]]);
      soils[i].id = idObj2[i];
    }

    //console.log("Soil.............. ", vals);
    ref = db.ref('/plant');
    ref.once('value', function(snapshot){
      var obj3 = JSON.parse(JSON.stringify(snapshot));
      var idObj3 = Object.keys(obj3);
      var plants = [];
      for(var i=0;i<idObj3.length;i++)
      {
        plants.push(obj3[idObj3[i]]);
        plants[i].id = idObj3[i];
      }
      var moment = require('moment');
      res.render('dashboard/farm/create_farm.ejs', {soils: soils, plants: plants, moment:moment});
    });
  });
};



//exports.create_a_farm = function(req, res) {
  /*int id;
  String title;
  String description;
  String latitude;
  String longitude;
  int zone_number;
  int watering_scheme;
  int soil_type;
  String soil_type_label;
  int photoId;
  Calendar calendar = Calendar.getInstance();
  int start_day = calendar.get(Calendar.DAY_OF_MONTH);
  int start_month = calendar.get(Calendar.MONTH);
  int start_year = calendar.get(Calendar.YEAR);*/
  /*var farm_id = uuidv1();
  var farm_title = req.body.add_farm_title;
  var farm_description = req.body.add_farm_description;
  var farm_latitude = req.body.add_farm_latitude;
  var farm_longitude = req.body.add_farm_longitude;
  var farm_tape_interval = req.body.add_farm_tape_interval;
  var farm_drip_interval = req.body.add_farm_drip_interval;
  var farm_drip_flowrate = req.body.add_farm_drip_flowrate;
  var farm_created_at = moment().format();

  // compute
  var farm_total_drip_per_rai = Math.floor(1600/(farm_tape_interval*farm_drip_interval));
  var farm_total_flowrate_per_rai = farm_total_drip_per_rai*farm_drip_flowrate;

  console.log('Create farm id = ' + farm_id);

  */
  /*var ref = db.ref('/mainpump/' + pump_id).set({
    write_api_key: write_api_key
  });*/

  /*
    var ref = db.ref('/farm').child(farm_id).set({
      title: farm_title,
      description: farm_description,
      latitude: farm_latitude,
      longitude: farm_longitude,
      tape_interval: farm_tape_interval,
      drip_interval: farm_drip_interval,
      drip_flowrate: farm_drip_flowrate,
      total_drip_per_rai: farm_total_drip_per_rai,
      total_flowrate_per_rai: farm_total_flowrate_per_rai,
      created_at: farm_created_at
    });
  res.redirect('farm');
};  */

exports.create_a_farm = function(req, res) {
    var watering_scheme = req.body.create_farm_watering_scheme;
    console.log("Watering schemeeeeeeeeeeeeee => ", watering_scheme);
    var ref = db.ref('/soil');
    ref.once('value', function(snapshot){
      var obj2 = JSON.parse(JSON.stringify(snapshot));
      var selected_soil = obj2[req.body.create_soil_id];
      //console.log("selected soil.....................", selected_soil);
      ref = db.ref('/plant');
      ref.once('value', function(snapshot){
        var obj3 = JSON.parse(JSON.stringify(snapshot));
        var selected_plant = obj3[req.body.create_plant_id];
        console.log("creating new farm data...");
        var farm_id = uuidv1();
        var farm_created_at = moment().format();
        //, soils: obj2 compute


        /*var ref = db.ref('/mainpump/' + pump_id).set({
          write_api_key: write_api_key
        });*/
        switch(watering_scheme)
        {
          case '1':
          var ref = db.ref('/farm').child(farm_id).set({
              title: req.body.create_farm_title,
              description: req.body.create_farm_description,
              latitude: req.body.create_farm_latitude,
              longitude: req.body.create_farm_longitude,
              soil_id: req.body.create_soil_id,
              soil_title: selected_soil.title_thai,
              plant_id: req.body.create_plant_id,
              plant_title: selected_plant.title,
              starting_date: req.body.create_farm_starting_date,
              watering_scheme: watering_scheme,
              sensor_critical_point: 15,
              //humidity_sensor_id: req.body.create_farm_humidity_sensor_id,
              //mainpump_id: req.body.create_farm_mainpump_id,
              //valve_1_id: req.body.create_farm_valve_1_id,
              //valve_2_id: req.body.create_farm_valve_2_id,
              sampling_time: 15,
              linegroup_token: req.body.create_farm_linegroup_token,
              activated: 'false',
              created_at: farm_created_at
            }, function(err){
              if(err)
                res.send("703");
              else {
                res.redirect('../farm');
              }
            });
            break;
          case '2':
            // compute
            var farm_tape_interval = 1.2;
            var farm_drip_interval = 0.3;
            var farm_drip_flowrate = 1.3;
            var farm_total_drip_per_rai = Math.floor(1600/(farm_tape_interval*farm_drip_interval));
            var farm_total_flowrate_per_rai = farm_total_drip_per_rai*farm_drip_flowrate;
            var ref = db.ref('/farm').child(farm_id).set({
                title: req.body.create_farm_title,
                description: req.body.create_farm_description,
                latitude: req.body.create_farm_latitude,
                longitude: req.body.create_farm_longitude,
                tape_interval: farm_tape_interval,
                drip_interval: farm_drip_interval,
                drip_flowrate: farm_drip_flowrate,
                total_drip_per_rai: farm_total_drip_per_rai,
                total_flowrate_per_rai: farm_total_flowrate_per_rai,
                soil_id: req.body.create_soil_id,
                soil_title: selected_soil.title_thai,
                plant_id: req.body.create_plant_id,
                plant_title: selected_plant.title,
                watering_scheme: watering_scheme,
                //mainpump_id: req.body.create_farm_mainpump_id,
                //valve_1_id: req.body.create_farm_valve_1_id,
                //valve_2_id: req.body.create_farm_valve_2_id,
                starting_date: req.body.create_farm_starting_date,
                linegroup_token: req.body.create_farm_linegroup_token,
                activated: 'false',
                created_at: farm_created_at
              }, function(err){
                if(err)
                  res.send("703");
                else {
                  var ETp = require('../../etp/ETp.js');
                  var watering_schedule = ETp.computeWateringSchedule(farm_id, function(ws){
                    ref = db.ref('/farm').child(farm_id).update({
                      watering_schedule: ws
                    }, function(err){
                        if(err)
                          res.send("704");
                        else
                          res.redirect('../farm');
                    });
                  });
                };
              });
            break;
        }

          /*
            var ref = db.ref('/farm').child(farm_id).set({
                title: req.body.create_farm_title,
                description: req.body.create_farm_description,
                latitude: req.body.create_farm_latitude,
                longitude: req.body.create_farm_longitude,
                tape_interval: req.body.create_farm_tape_interval,
                drip_interval: req.body.create_farm_drip_interval,
                drip_flowrate: req.body.create_farm_drip_flowrate,
                total_drip_per_rai: farm_total_drip_per_rai,
                total_flowrate_per_rai: farm_total_flowrate_per_rai,
                soil_id: req.body.create_soil_id,
                soil_title: selected_soil.title_thai,
                plant_id: req.body.create_plant_id,
                plant_title: selected_plant.title,
                starting_date: req.body.create_farm_starting_date,
                water_scheme: water_scheme,
                created_at: farm_created_at
              }, function(err){
                if(err)
                  res.send("703");
                else {
                  res.redirect('../farm');
                }
              });
              */
      });
    });

};

exports.edit_a_farm = function(req, res) {
  var farm_id = req.params.id;
  var ref = db.ref('/farm/' + farm_id);
  ref.once('value', function(snapshot) {
    var obj = JSON.parse(JSON.stringify(snapshot));
    //res.redirect('../farm');
    //console.log("Edit farm[" + farm_id + "].......................................");
    obj.id = farm_id;
    ref = db.ref('/soil');
    ref.once('value', function(snapshot){
      var obj2 = JSON.parse(JSON.stringify(snapshot));
      var idObj2 = Object.keys(obj2);
      var soils = [];
      for(var i=0;i<idObj2.length;i++)
      {
        soils.push(obj2[idObj2[i]]);
        soils[i].id = idObj2[i];
      }

      //console.log("Soil.............. ", vals);
      ref = db.ref('/plant');
      ref.once('value', function(snapshot){
        var obj3 = JSON.parse(JSON.stringify(snapshot));
        var idObj3 = Object.keys(obj3);
        var plants = [];
        for(var i=0;i<idObj3.length;i++)
        {
          plants.push(obj3[idObj3[i]]);
          plants[i].id = idObj3[i];
        }
        var moment = require('moment');
        switch(obj.watering_scheme)
        {
          case '1':
            res.render('dashboard/farm/edit_farm1.ejs', {farm: obj, soils: soils, plants: plants, moment: moment});
            break;
          case '2':
            res.render('dashboard/farm/edit_farm2.ejs', {farm: obj, soils: soils, plants: plants, moment: moment});
            break;
        }

      });
    });
  });
};

exports.update_a_farm = function(req, res) {
  //, soils: obj2 compute

  /*var ref = db.ref('/mainpump/' + pump_id).set({
    write_api_key: write_api_key
  });*/
  var ref = db.ref('/soil');
  ref.once('value', function(snapshot){
    var obj2 = JSON.parse(JSON.stringify(snapshot));
    var selected_soil = obj2[req.body.edit_soil_id];
    //console.log("selected soil.....................", selected_soil);
    ref = db.ref('/plant');
    ref.once('value', function(snapshot){
      var obj3 = JSON.parse(JSON.stringify(snapshot));
      var selected_plant = obj3[req.body.edit_plant_id];
      var farm_id = req.body.edit_farm_id;
      var farm_starting_date = req.body.edit_farm_starting_date;
      var farm_created_at = moment().format();
      var farm_watering_scheme = req.body.edit_farm_watering_scheme;

      switch(farm_watering_scheme){
        case '1':
          /*var ref = db.ref('/mainpump/' + pump_id).set({
            write_api_key: write_api_key
          });*/
          var ref = db.ref('/farm').child(farm_id).update({
              title: req.body.edit_farm_title,
              description: req.body.edit_farm_description,
              latitude: req.body.edit_farm_latitude,
              longitude: req.body.edit_farm_longitude,
              soil_id: req.body.edit_soil_id,
              soil_title: selected_soil.title_thai,
              plant_id: req.body.edit_plant_id,
              plant_title: selected_plant.title,
              sensor_critical_point: req.body.edit_farm_sensor_critical_point,
              watering_scheme: farm_watering_scheme,
              starting_date: farm_starting_date,
              humidity_sensor_id: req.body.edit_farm_humidity_sensor_id,
              mainpump_id: req.body.edit_farm_mainpump_id,
              valve_1_id: req.body.edit_farm_valve_1_id,
              valve_2_id: req.body.edit_farm_valve_2_id,
              sampling_time: req.body.edit_farm_sampling_time,
              linegroup_token: req.body.edit_farm_linegroup_token,
              created_at: farm_created_at
            }, function(err){
              if(err)
                res.send("703");
              else {
                //console.log("current edit farm directory => ", __dirname);
                res.redirect('../../farm');
              }
            });
          break;
        case '2':
        //, soils: obj2 compute
        var farm_total_drip_per_rai = Math.floor(1600/(req.body.edit_farm_tape_interval*req.body.edit_farm_drip_interval));
        var farm_total_flowrate_per_rai = farm_total_drip_per_rai*req.body.edit_farm_drip_flowrate;

        /*var ref = db.ref('/mainpump/' + pump_id).set({
          write_api_key: write_api_key
        });*/
        var ETp = require('../../etp/ETp.js');
        var watering_schedule = ETp.computeWateringSchedule(farm_id, function(ws){
          var ref = db.ref('/farm').child(farm_id).update({
              title: req.body.edit_farm_title,
              description: req.body.edit_farm_description,
              latitude: req.body.edit_farm_latitude,
              longitude: req.body.edit_farm_longitude,
              tape_interval: req.body.edit_farm_tape_interval,
              drip_interval: req.body.edit_farm_drip_interval,
              drip_flowrate: req.body.edit_farm_drip_flowrate,
              total_drip_per_rai: farm_total_drip_per_rai,
              total_flowrate_per_rai: farm_total_flowrate_per_rai,
              soil_id: req.body.edit_soil_id,
              soil_title: selected_soil.title_thai,
              plant_id: req.body.edit_plant_id,
              plant_title: selected_plant.title,
              watering_scheme: farm_watering_scheme,
              watering_schedule: ws,
              starting_date: farm_starting_date,
              mainpump_id: req.body.edit_farm_mainpump_id,
              valve_1_id: req.body.edit_farm_valve_1_id,
              valve_2_id: req.body.edit_farm_valve_2_id,
              linegroup_token: req.body.edit_farm_linegroup_token,
              created_at: farm_created_at
            }, function(err){
              if(err)
                res.send("703");
              else {
                //console.log("current edit farm directory => ", __dirname);
                res.redirect('../../farm');
              }
            });
          });

          break;
      }
    });
  });
}

exports.form_common = function(req, res){
  res.render('dashboard/form-common.ejs', {});
};

exports.delete_a_farm_id = function(req, res){
  var farm_id = req.params.id;
  console.log("Delete farm by id => " + farm_id);
  var ref = db.ref('/farm/'+farm_id).remove(function(err){
    if(err)
      return res.send();
    res.redirect('../../farm');
  });
};

exports.activate_farm_1 = function(req, res){
  var farm_id = req.params.id;
  var farm_sampling_time;
  var count = 0;
  var ref = db.ref('/farm/'+farm_id);
  ref.once('value', function(snapshot) {
    var farmObj = JSON.parse(JSON.stringify(snapshot));
    farm_sampling_time = parseInt(farmObj.sampling_time)*60000;
    ref.update({
      activated: 'true'
    }, function(err){
        if(err)
          res.respond("705");
        else {
          console.log("farm[" + farm_id + "] has been activated! with sampling time => " + farm_sampling_time.toString() + " millisecs...");
          var farmIntervalId = setInterval(function(res){
              var ref2 = db.ref('/farm/'+farm_id);
              ref2.once('value', function(snapshot){
                var fo = JSON.parse(JSON.stringify(snapshot));
                if(fo.activated == 'false')
                  {
                    count = 0;
                    console.log("farm[" + farm_id + "] has been deactivated.");
                    clearInterval(farmIntervalId);
                  }
                else {
                  count++;
                  var sensor = require('../../sensor/sensor.js');
                  sensor.getSensorValue(fo.humidity_sensor_id, 1, function(err, s){
                    var ss = JSON.parse(JSON.stringify(s));
                    if(err)
                    {
                      console.log("reading from sensor[" + fo.humidity_sensor_id + "] error!!!!");
                    }
                    else {
                      console.log("farm[" + farm_id + "] checking humidity sensor #" + count + " = " + ss.sensor_value + " value at time => " + ss.created_at);
                      if(ss.sensor_value < fo.sensor_critical_point)
                      {
                        var line = require('../../line/line.js');
                        console.log("humidity deplete!!!...alert for watering");
                        var d = new Date();
                        line.lineGroupNotify("ความชื้นในแปลงเท่ากับ " + ss.sensor_value + "% มีค่าต่ำกว่าจุดวิกฤต " + fo.sensor_critical_point + "% ณ เวลา " + d + " เตรียมเปิดระบบให้น้ำ" + fo.title, fo.linegroup_token);
                      }
                    }
                  });
                  }
              });
            }, farm_sampling_time, res);
            console.log("finished activating farm!!!!!!!!!");
            //res.send("start farm[" + farm_id + "]... done!");
            //res.setHeader("Content-Type", "text/html");
            res.redirect("../../farm");
            //console.log("finished redirecting farm!!!!!!!!!");
          };
      });
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};

exports.deactivate_farm_1 = function(req, res){
  var farm_id = req.params.id;
  var ref = db.ref('/farm/').child(farm_id).update({
    activated: 'false'
  }, function(err){
    if(err)
      res.send("706");
    else {
      //console.log("farm[" + farm_id + "] is going to be deactivated...");
      //res.send("farm[" + farm_id + "] has been deactivated...");
      res.redirect("../../farm");
    }
  });
};

exports.show_farm_location = function(req, res){
  var farm_id = req.params.id;
  var ref = db.ref('/farm/' + farm_id);
  ref.once('value', function(snapshot) {
    var farmObj = JSON.parse(JSON.stringify(snapshot));
    res.render('dashboard/farm/show_farm_location.ejs', {farm: farmObj});
  });
};


exports.list_all_hardware = function(req, res){
  ref.on("value", function(snapshot) {
    var obj = JSON.stringify(snapshot.val());
    //console.log("Number of object => " + obj.length);
    res.render(obj);
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
};


exports.compute_etp = function(req, res){
  var ETp = require('../../etp/ETp.js');
  var latitude = req.params.latitude;
  var longitude = req.params.longitude;
  console.log("Compute ETp with (lat,long) => ", latitude, longitude);
  //14.8766249,102.0061992
  var etp = ETp.computeETp(latitude, longitude);
  res.send(etp);
}

exports.compute_watering_schedule = function(req, res){
  var ETp = require('../../etp/ETp.js');
  var farm_id = req.params.farm_id;
  /*async.waterfall([
      function(callback){
        var watering_schedule = ETp.computeWateringSchedule(farm_id);
        console.log("Watering Schedule 0");
        callback(null, watering_schedule);
      },
      function(a, callback){
        console.log("Watering Schedule 1 => ", a);
        callback(null, a);
      }
  ], function(err, c){
    console.log("Watering Schedule 2 => ", c);
    res.send(c);
  }); */
  function computeWateringScheduleFinished(next_watering, res){
    console.log("Watering schedule finished!!!!!!!!!!!")
    //console.log(next_watering);
    res.send(next_watering);
  }

  ETp.computeWateringSchedule(farm_id, computeWateringScheduleFinished, res);

}
