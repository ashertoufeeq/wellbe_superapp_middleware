const _ = require('lodash');

const { textVariableAdapter } = require('./string');
const defaultMessageTemplates = require('../../constants/messageConfig/default.js');

const _getMessageInternal = ({
  templateId,
  textVariables,
  mediaVariables,
  smsVariables,
  templates = defaultMessageTemplates,
}) => {
  const mess = _.find(templates, ['templateId', templateId]);
  if (!mess) {
    return null;
  }

  const sms = textVariableAdapter({ text: mess.smsText, vars: smsVariables });
  const whatsapp = textVariableAdapter({
    text: mess.text,
    vars: textVariables,
  });

  return {
    template: mess.customId || mess.templateId,

    whatsapp,
    sms: sms || whatsapp,
    media: textVariableAdapter({ text: mess.mediaText, vars: mediaVariables }),
  };
};

const getMessage = ({
  templateId,
  textVariables,
  mediaVariables,
  smsVariables,
}) => {
  const props = {
    templateId,
    textVariables,
    mediaVariables,
    smsVariables,
  };


  return _getMessageInternal(props);
};

module.exports = { getMessage };
