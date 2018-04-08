'use strict';

module.exports = function(app) {
  var farmDetails = require('../controllers/farmDetailController');

  app.route('/form_common')
    .get(farmDetails.form_common);

  // todoList Routes
  app.route('/farm')
    .get(farmDetails.list_all_farm)
    .post(farmDetails.new_farm);
  app.route('/farm/:type')
    .get(farmDetails.list_all_farm_type);
  app.route('/farm/create')
    .post(farmDetails.create_a_farm);
  app.route('/farm/edit/:id')
    //.get(farmDetails.edit_mainpump);
    .post(farmDetails.edit_a_farm);
  app.route('/farm/update/:id')
    .post(farmDetails.update_a_farm);
  app.route('/farm/delete/:id')
    .post(farmDetails.delete_a_farm_id);
  app.route('/farm/activate1/:id')
    .post(farmDetails.activate_farm_1);
  app.route('/farm/deactivate1/:id')
    .post(farmDetails.deactivate_farm_1);
  app.route('/farm/location/:id')
    .get(farmDetails.show_farm_location);

  app.route('/listHardware')
    .get(farmDetails.list_all_hardware)

  // User
  app.route('/user')
    .get(farmDetails.list_all_users)
    .post(farmDetails.create_a_user);


  app.route('/computeETp/:latitude/:longitude')
    .get(farmDetails.compute_etp);
  app.route('/computeWateringSchedule/:farm_id')
    .get(farmDetails.compute_watering_schedule);
};
