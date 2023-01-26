const axios = require("axios");
const moment = require("moment");

module.exports = async () => {
  console.log("Adding Shruti patients");
  try {
    const {
      data: { token },
    } = await axios.post(process.env.SHRUTI_BASE_URL + "/blossom-login", {
      username: process.env.SHRUTI_USER,
      password: process.env.SHRUTI_PASSWORD,
    });

    const {
      data: { data: patients },
    } = await axios.post(
      process.env.SHRUTI_BASE_URL + "/blossom-patients",
      {
        limit: 30,
        screened_date: {
          start_date: moment().subtract(5, 'days').startOf('days').toISOString(),
          end_date: moment().format("YYYY-MM-DD"),
        },
        // token_numbers: ["MH-2200033"],
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    console.log(patients, JSON.stringify(patients[1] || {}), 'patient');
  } catch (e) {
    console.log(e);
  }
};
