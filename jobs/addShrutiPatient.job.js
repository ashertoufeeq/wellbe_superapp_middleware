const axios = require("axios");
const moment = require("moment");

module.exports = async () => {
  try {
    const {
      data: { token },
    } = await axios.post(process.env.SHRUTI_BASE_URL + "/blossom-login", {
      username: process.env.SHRUTI_USER,
      password: process.env.SHRUTI_PASSWORD,
    });

    const {
      data: { data: patient },
    } = await axios.post(
      process.env.SHRUTI_BASE_URL + "/blossom-patients",
      {
        limit: 10000,
        screened_date: {
          start_date: moment().format("YYYY-MM-DD"),
          end_date: moment().format("YYYY-MM-DD"),
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  } catch (e) {
    console.log(e);
  }
};
