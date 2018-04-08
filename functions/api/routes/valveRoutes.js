'use strict';

module.exports = function(app) {
  var valve = require('../controllers/valveController');

  // Valves
  app.route('/valve')
    .get(valve.list_all_valves)
    .post(valve.create_a_valve);
  app.route('/valve/edit')
      //.get(farmDetails.edit_mainpump);
    .post(valve.edit_a_valve);
  app.route('/valve/delete')
    .post(valve.delete_a_valve);
  app.route('/valve/delete/:id')
    .post(valve.delete_a_valve_id);
  app.route('/valve/activate/:id')
    .post(valve.activate_valve);
  app.route('/valve/deactivate/:id')
    .post(valve.deactivate_valve);
  app.route('/valve/turnon/:id/:key/:field')
    .post(valve.turnon_valve);
  app.route('/valve/turnoff/:id/:key/:field')
    .post(valve.turnoff_valve);
}
