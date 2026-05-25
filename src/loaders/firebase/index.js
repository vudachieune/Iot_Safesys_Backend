const { credential } = require('firebase-admin');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { default: Container } = require('typedi');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../google-application-credentials.json'));
const { DI_KEYS } = require('../../commons/constants');
const logger = require('../winston');

module.exports = function firebaseLoader() {
  const app = admin.initializeApp({
    credential: credential.cert(serviceAccount),
  });
  const firestore = getFirestore();
  const auth = getAuth();

  Container.set(DI_KEYS.FB_APP, app);
  Container.set(DI_KEYS.FB_DB, firestore);
  Container.set(DI_KEYS.FB_AUTH, auth);

  logger.info('Firebase loaded');
};

// co chuc nang la ket noi den firebase, va luu tru cac doi tuong lien quan vao container de su dung sau nay
