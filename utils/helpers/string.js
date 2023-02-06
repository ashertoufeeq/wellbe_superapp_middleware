const axios = require('axios');
const getURLs = require('get-urls');
const { URL } = require('url');
const app = require('../../index');

let allowedMessageDomains;
const s3regex = new RegExp('.+.s3.(.+.)?amazonaws.com');
const metahosRegex = new RegExp('.+.metahos.com');

const shortenURLsInText = (text) => {
  return new Promise((resolve, reject) => {
    if (!process.env.FIREBASE_WEB_KEY) {
      return resolve(text);
    }

    if (!allowedMessageDomains)
      allowedMessageDomains = [new URL('https://wellbe.metahos.com').hostname];

    const longURLs = [...getURLs(text)].filter((url) => {
      const { hostname } = new URL(url);
      if (hostname.match(s3regex) || hostname.match(metahosRegex)) {
        return true;
      }

      return allowedMessageDomains.includes(hostname);
    });

    const sortURLPromises = longURLs.map((url) =>
      axios.post(
        `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_WEB_KEY}`,
        {
          dynamicLinkInfo: {
            domainUriPrefix:
              process.env.FIREBASE_URL_PREFIX || 'https://m16.app',
            link: url,
            navigationInfo: {
              enableForcedRedirect: true,
            },
          },
          suffix: {
            option: 'SHORT',
          },
        },
      ),
    );

    Promise.all(sortURLPromises)
      .then((firebaseResponses) => {
        const shortURLs = firebaseResponses.map(
          (response) => response.data.shortLink,
        );
        let message = text;
        shortURLs.map((shortURL, index) => {
          message = message.replace(longURLs[index], shortURL);
        });

        resolve(message);
      })
      .catch(reject);
  });
};

const testJSON = (text) => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};

const isBoolean = (text) => text === 'false' || text === 'true';

const textVariableAdapter = ({ text, vars, placeholder = '{{}}' }) => {
  const vs = vars || [];
  let newText = text || '';
  for (const v of vs) {
    newText = newText.replace(placeholder, v || '-');
  }
  newText = newText.split(placeholder).join('');

  return newText;
};

const getUrl = ({ link, params }) => {
  const url = new URL(link);
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      url.searchParams.append(key, params[key]);
    }
  }

  return url.href;
};

function getFilenameFromUrl(url) {
  const pathname = new URL(url).pathname;
  const index = pathname.lastIndexOf('/');
  return pathname.substring(index + 1); // if index === -1 then index+1 will be 0
}

module.exports = {
  getUrl,
  testJSON,
  isBoolean,
  shortenURLsInText,
  textVariableAdapter,
  getFilenameFromUrl,
};
