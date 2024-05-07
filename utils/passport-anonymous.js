const { Strategy } = require('passport-anonymous');

module.exports = (passport) => {
  passport.use(new Strategy());
};