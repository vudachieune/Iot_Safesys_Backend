const CronJob = require('cron').CronJob;
const configs = require('../../commons/configs');
const DeviceService = require('../../modules/devices/device.service');
const logger = require('../winston');

const checkDeviceConnectJob = new CronJob(
  `*/${configs.CHECK_DEVICE_INTERVAL} * * * *`,
  () => {
    const deviceService = new DeviceService();

    deviceService.checkDeviceConnect();
  },
  null,
  true,
  'Asia/Ho_Chi_Minh',
);

const cronJobsLoader = () => {
  checkDeviceConnectJob.start();
  logger.info(
    `[CronJob] checkDeviceConnectJob started with interval ${configs.CHECK_DEVICE_INTERVAL} minutes`,
  );
};

module.exports = cronJobsLoader;
// chuc nang la khoi tao cac cron job, va dang ky cac cron job vao he thong de chay theo lich trinh dinh san
// cronjob la mot co che de thuc hien mot cong viec nao do theo mot lich trinh dinh san, trong truong hop nay la kiem tra xem cac thiet bi co ket noi den server hay khong, va neu khong thi se cap nhat trang thai cua thiet bi do trong database, de phan biet giua cac thiet bi dang ket noi va cac thiet bi da mat ket noi