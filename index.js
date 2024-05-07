const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Agenda = require("agenda");
const Agendash = require("agendash");
const mongoose = require("mongoose");
const path = require("path");
const moment = require('moment-timezone');
const passport = require('passport')

const camps = require("./models/camps.model");
const site = require("./models/site.model");
const patientRecord = require("./models/patientRecord");
const consultationItem = require("./models/consultationitem");
const campScreening = require("./models/campScreening.model");
const Program = require("./models/program.model");
const labItem = require("./models/labItem");
const rootRouter = require("./routes/index");
const MongoClient = require('mongodb').MongoClient;

const ESISDB  = (exports.ESISDB = new MongoClient(process.env.ESIS_URI));
console.log('esis connected');    

const app = express();
app.options("*", cors());
app.use(cors());

app.use(passport.initialize());
require('./utils/passport')(passport);
require('./utils/passport-anonymous')(passport);

app.use(express.static(path.join(__dirname, "public")));

console.log(
  path.join(__dirname, "views"),
  express.static(path.join(__dirname, "public"))
);


mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("main connected");
  })
  .then(async () => {
    
  })
  .catch((err) => console.warn(err));

  

app.use((req, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;

  const {
    rawHeaders,
    httpVersion,
    method,
    socket,
    originalUrl,
    body,
    header,
    user,
  } = req;
  const { remoteFamily } = socket;
  console.log(
    JSON.stringify({
      rawHeaders,
      httpVersion,
      remoteFamily,
    }),
    "\n",
    JSON.stringify({
      ip: req.header("x-forwarded-for"),
      method: method,
      url: originalUrl,
      body: body,
      user: user,
      timestamp: new Date(),
    })
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));

app.listen(process.env.PORT || 4000, async () => {
console.log(`Running server... http://localhost:${process.env.PORT || 4000}`);
});
app.use("/", rootRouter);

const timezone = process.env.TIMEZONE || 'Asia/Kolkata';
