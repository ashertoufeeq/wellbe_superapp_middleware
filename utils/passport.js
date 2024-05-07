const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.HASH_KEY;

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(jwt_payload, done)
        promise = Promise.resolve({ disabled: false, __payload: jwt_payload });
        done(null, {mobile: jwt_payload?.contact});
    }),
  );
};