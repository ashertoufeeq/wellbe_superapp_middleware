const express = require("express");
const router = express.Router();
const passport = require('passport');

const auth = require('./auth')
const esis = require('./esis')

router.use('/auth', auth)
router.use('/esis',
  passport.authenticate('jwt', { session: false }), 
esis)

module.exports = router;
