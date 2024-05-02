const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Agenda = require("agenda");
const Agendash = require("agendash");
const mongoose = require("mongoose");
const path = require("path");

const camps = require("./models/camps.model");
const site = require("./models/site.model");
const patientRecord = require("./models/patientRecord");
const consultationItem = require("./models/consultationitem");
const campScreening = require("./models/campScreening.model");
const Program = require("./models/program.model");
const labItem = require("./models/labItem");


const app = express();
app.options("*", cors());
app.use(cors());

const jobs = require("./jobs");

app.use(express.static(path.join(__dirname, "public")));

console.log(
  path.join(__dirname, "views"),
  express.static(path.join(__dirname, "public"))
);


let agenda;
if (!process.env.NO_JOB) {
  agenda = new Agenda({
    db: {
      address: process.env.MONGO_URI,
      collection: "blossommmu",
    },
    defaultLockLifetime: 240000,
    defaultConcurrency: 100,
  });
  app.use("/dash", Agendash(agenda));
}
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("db connected");

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


function time() {
  return new Date().toTimeString().split(" ")[0];
}


if (!process.env.NO_JOB) {
  agenda.define("Run Analytics", { concurrency: 10 }, async (job, done) => {
    console.log("running Run Analytics -> ", new Date());
    try {
      await jobs.addConsultations();
      done();
    } catch (err) {
      console.log(err, "Failed -> Run Analytics");
      done();
    }
  });
(async function () {
  await agenda.start();
  await agenda.every(
    "0 13 * * *",
    ["Run Analytics"],
    {},
    {
      timezone: "Asia/Kolkata",
    }
  );

  agenda.on("start", (job) => {
    console.log(time(), `Job <${job.attrs.name}> starting`);
  });
  agenda.on("success", (job) => {
    console.log(time(), `Job <${job.attrs.name}> succeeded`);
  });
  agenda.on("fail", (error, job) => {
    console.log(time(), `Job <${job.attrs.name}> failed:`, error);
  });
})();
}

