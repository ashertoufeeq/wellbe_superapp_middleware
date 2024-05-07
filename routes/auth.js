const express =  require('express');
const otpGenerator = require('otp-generator');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const sendMessage = require('../utils/message')

const router = express.Router();

router.post('/verifyOtp', (req, res)=> {
    const {hash, mobile, otp,} = req.body;
    const key = process.env.HASH_KEY;
    let [hashValue, expires] = hash.split('.');
    let now = Date.now();
    if (now > parseInt(expires)) {
      res.json({ error: 'OTP expired' });
    } else {
        let data = `${mobile}.${otp}.${expires}`;
      console.log(data);
      let newCalculatedHash = crypto
        .createHmac('sha256', key)
        .update(data)
        .digest('hex');
      console.log(newCalculatedHash);
      if (newCalculatedHash === hashValue) {
        jwt.sign(
          {
            type: 'Patient_List',
            contact: req.body.mobile,
          },
          process.env.HASH_KEY,
          { expiresIn: 360000000000000000000000000000000000 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          },
        );
      } else res.json({ error: 'Invalid OTP' });
    }
})

router.get("/generateOtp/:mobile", (req, res) => {
  console.log("/patient/generateOtp");
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  console.log(otp,'here')
  const key = process.env.HASH_KEY || '';
  const ttl = 5 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${req.params.mobile}.${otp}.${expires}`;
  console.log(data);
  const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
  const fullHash = `${hash}.${expires}`;
  sendMessage({
    messageText: `Dear user your one-time password to login to the platform is ${otp}`,
    to: req.params.mobile,
    toEmail: req.query.email,
    templateId: "one_time_password",
    textParameters: [otp],
    sendTitle: false,
  })
    .then((resp) => {
      res.json({ hash: fullHash });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: "internal server error" });
    });
});

module.exports = router;