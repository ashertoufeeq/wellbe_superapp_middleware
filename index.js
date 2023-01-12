const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Agenda = require("agenda");
const Agendash = require("agendash");

const app = express();
const jobs = require("./jobs");

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
  },
  defaultLockLifetime: 240000,
  defaultConcurrency: 100,
});

app.use("/dash", Agendash(agenda));

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
  jobs.addShrutiPatient();
});

// agenda.define("Get Patients", { concurrency: 10 }, async (job, done) => {
//   if (!connection) {
//     connection = await connectDB();
//   }
//   console.log("running Get patients -> ", new Date());
//   try {
//     await PatientJobs.add(connection);
//     done();
//   } catch (err) {
//     console.log(err, "Failed -> Get Patients");
//     done();
//   }
// });

function time() {
  return new Date().toTimeString().split(" ")[0];
}

// (async function () {
//   await agenda.start();
//   await agenda.every("*/2 * * * *", [
//     "Get Patients",
//     "Get Consultations (cuddles)",
//     "Get Consultations (kondapur)",
//   ]);
//   await agenda.every("0 0 * * *", "Get Patients (end of day)");
//   agenda.on("start", (job) => {
//     console.log(time(), `Job <${job.attrs.name}> starting`);
//   });
//   agenda.on("success", (job) => {
//     console.log(time(), `Job <${job.attrs.name}> succeeded`);
//   });
//   agenda.on("fail", (error, job) => {
//     console.log(time(), `Job <${job.attrs.name}> failed:`, error);
//   });
// })();
