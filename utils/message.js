const axios = require("axios");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const sendMessageBird = async ({
  message,
  to,
  media,
  toMultiple = false,
  templateId,
  textParameters = [],
}) => {
  console.log("FROM MESSAGE BIRD", {
    message,
    to,
    media,
    toMultiple,
    templateId,
    textParameters,
  });

  if (toMultiple) {
    const promises = [];
    for (const mobile of to) {
      promises.push(
        sendMessageBird({
          message,
          mobile,
          media,
          templateId,
          textParameters,
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
          templateName: templateId,
          language: {
            code: "en",
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

    return axios.post(`https://conversations.messagebird.com/v1/send`, body, {
      httpsAgent: agent,
      headers: { Authorization: `AccessKey ${process.env.MESSAGE_BIRD_KEY}` },
    });
  }
};

module.exports = sendMessageBird;
