const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Agenda = require("agenda");
const Agendash = require("agendash");
const mongoose = require("mongoose");
const path = require("path");

const camps = require("./models/camps.model");
const patientRecord = require("./models/patientRecord");
const campScreening = require("./models/campScreening.model");
const Program = require("./models/program.model");
const labItem = require("./models/labItem");
const mergeByUrl = require("./scripts/index");

const app = express();
const jobs = require("./jobs");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

console.log(
  path.join(__dirname, "views"),
  express.static(path.join(__dirname, "public"))
);

const rootRouter = require("./routes");

let agenda;
if (!process.env.NO_JOB) {
  agenda = new Agenda({
    db: {
      address: process.env.MONGO_URI,
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
    jobs.analytics.add();
    console.log("db connected");
  })
  .catch((err) => console.warn(err));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));

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

app.listen(process.env.PORT || 4000, async () => {
  console.log("Running server... http://localhost:4000");
});

app.use("/", rootRouter);

function time() {
  return new Date().toTimeString().split(" ")[0];
}

if (!process.env.NO_JOB) {
  agenda.define("Run Analytics", { concurrency: 10 }, async (job, done) => {
    console.log("running Run Analytics -> ", new Date());
    try {
      await jobs.analytics.add();
      done();
    } catch (err) {
      console.log(err, "Failed -> Run Analytics");
      done();
    }
  });

  agenda.define(
    "Run Consolidated Report",
    { concurrency: 10 },
    async (job, done) => {
      console.log("running Run Consolidated Report -> ", new Date());
      try {
        await jobs.generateConsolidatedReport();
        done();
      } catch (err) {
        console.log(err, "Failed -> Run Consolidated Report");
        done();
      }
    }
  );

  (async function () {
    await agenda.start();
    await agenda.every("*/10 * * * *", "Run Analytics");
    await agenda.every("0 0 * * *", "Run Consolidated Report");
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
