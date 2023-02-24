const axios = require("axios");
const https = require("https");
const { shortenURLsInText } = require('./helpers/string')
const { getMessage } = require('./helpers/message')

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const sendSMSCountry = async ({ to, smsText }) => {
  const res = await axios.get(
    `http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=${process.env.MSG_USER
    }&passwd=${process.env.MSG_AUTH}&mobilenumber=${to
    // (app.locals.config.countryCode || '91') + to
    }&message=${smsText}&SID=METAOS&mtype=LNG&DR=Y"`,
  );
  console.log(res);
};

const sendMessageBird = async ({
  message,
  to,
  media,
  toMultiple = false,
  templateId: baseTemplateId,
  smsParameters = [],
  textParameters = [],
  languageCode = 'en'
}) => {
  console.log("FROM MESSAGE BIRD", {
    message,
    to,
    media,
    toMultiple,
    templateId: baseTemplateId,
    textParameters,
  });

  if (toMultiple) {
    const promises = [];
    for (const mobile of to) {
      promises.push(
        sendMessageBird({
          message,
          to: mobile,
          media,
          templateId: baseTemplateId,
          textParameters,
          smsParameters,
          languageCode
        })
      );
    }

    await Promise.all(promises);
    return;
  } else {
    const body = {
      type: "hsm",
      content: {
        hsm: {
          namespace: "7996883d_d363_4780_8dcd_a98add271cc0",
          templateName: baseTemplateId,
          language: {
            code: languageCode || "en",
          },
          ...((textParameters || media) && {
            components: [
              ...(media
                ? [
                  {
                    type: "header",
                    parameters: [
                      media.url.includes(".pdf")
                        ? { type: "document", document: { url: media.url } }
                        : { type: "image", image: { url: media.url } },
                    ],
                  },
                ]
                : []),
              ...(textParameters && textParameters.length > 0
                ? [
                  {
                    type: "body",
                    parameters: textParameters.map((text) => ({
                      type: "text",
                      text: String(text),
                    })),
                  },
                ]
                : []),
            ],
          }),
        },
      },
      to: "+91" + to,
      from: "524344ed-648b-429f-b4e6-ecd5904b3d8e",
    };
    const mess = getMessage({
      templateId: baseTemplateId,
      textVariables: textParameters,
      mediaVariables: [],
      smsVariables: smsParameters || textParameters,
    });

    const {
      sms: _smsText,
      whatsapp: _whatsappText,
      media: __mediaText,
      template: templateId,
    } = mess || {
      sms: message,
      whatsapp: message,
      media: '',
      template: baseTemplateId,
    };
    const smsText = _smsText ? await shortenURLsInText(_smsText) : Promise.resolve(_smsText);
    console.log({ smsText, smsParameters });
    await sendSMSCountry({ smsText, to });
    
    return axios.post(`https://conversations.messagebird.com/v1/send`, body, {
      httpsAgent: agent,
      headers: { Authorization: `AccessKey ${process.env.MESSAGE_BIRD_KEY}` },
    });
  }
};

module.exports = sendMessageBird;
