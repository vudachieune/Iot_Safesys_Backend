const configs = require('../../commons/configs');
const logger = require('../../loaders/winston');

function getTwilioClient() {
  if (!configs.TWILIO_ENABLED) {
    return null;
  }

  if (!configs.TWILIO_ACCOUNT_SID || !configs.TWILIO_AUTH_TOKEN || !configs.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio is enabled but credentials are incomplete. Skipping Twilio action.');
    return null;
  }

  return require('twilio')(configs.TWILIO_ACCOUNT_SID, configs.TWILIO_AUTH_TOKEN);
}

async function sendSMS(to, body = '') {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return null;

    return twilioClient.messages.create({
      from: configs.TWILIO_PHONE_NUMBER,
      to,
      body,
    });
  } catch (error) {
    logger.error(`Error sending SMS to ${to}`, error);
  }
}

async function makeCall(to, url = 'http://demo.twilio.com/docs/voice.xml') {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return null;

    return twilioClient.calls.create({
      from: configs.TWILIO_PHONE_NUMBER,
      to,
      url,
    });
  } catch (error) {
    logger.error(`Error making call to ${to}`, error);
  }
}

module.exports = {
  sendSMS,
  makeCall,
};
