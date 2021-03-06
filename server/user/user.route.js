const express = require('express');
const validate = require('express-validation');
const userValidation = require('./user.validation');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of users */
  .get(validate(userValidation.listUser), userCtrl.listUsers)

  /** POST /api/users - Create new user */
  .post(validate(userValidation.create), userCtrl.create);

// router.route('/google')
//   /** POST /api/users - Create new user with google*/
//   .post(validate(userValidation.createUserGoogle), userCtrl.createGoogle);

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(validate(userValidation.get), userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .patch(validate(userValidation.update), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(validate(userValidation.remove), userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
