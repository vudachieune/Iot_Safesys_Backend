const mqtt = require('mqtt');
const { Container } = require('typedi');

const configs = require('../../commons/configs');
const DeviceService = require('../../modules/devices/device.service');
const logger = require('../winston');

module.exports = function mqttLoader() {
  const mqttClient = mqtt.connect(configs.MQTT_HOST, {
    port: configs.MQTT_PORT,
    username: configs.MQTT_USERNAME,
    password: configs.MQTT_PASSWORD,
  });
  Container.set('mqttClient', mqttClient);

  mqttClient.on('connect', function () {
    logger.info(`MQTT connected to ${configs.MQTT_HOST}:${configs.MQTT_PORT}`);

    mqttClient.subscribe(`${configs.MQTT_TOPIC_PREFIX}/location`, function (err) {
      if (err) {
        logger.error('MQTT subscribe error', err);
      } else {
        logger.info(`[MQTT] Subscribed topic ${configs.MQTT_TOPIC_PREFIX}/location`);
      }
    });
  });

  mqttClient.on('message', async function (topic, message) {
    if (topic === `${configs.MQTT_TOPIC_PREFIX}/location`) {
      // Decode base64
      const rawData = message.toString();
      logger.info(`[MQTT] Received message on topic ${topic}: ${rawData}`);

      /**
       * @type {ReceivedLocationData}
       */
      let receivedData = {};

      // Check if raw data is JSON or is Base64
      try {
        if (rawData.startsWith('{')) {
          receivedData = JSON.parse(rawData);
        } else {
          receivedData = JSON.parse(Buffer.from(message.toString(), 'base64').toString('ascii'));
        }
        logger.info(
          `[MQTT] Parsed payload deviceId=${receivedData.deviceId} status=${receivedData.status} antiTheft=${receivedData.antiTheft}`,
        );
      } catch (error) {
        logger.error(`[MQTT] Parse message error on topic ${topic}`, error);
        return;
      }

      const deviceService = new DeviceService();
      await deviceService.handleReceivedLocation(receivedData);
    }
  });
}; 
