const { default: Container } = require('typedi');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const jwtVerify = promisify(jwt.verify);

const { DI_KEYS, MESSAGES } = require('../../commons/constants');
const configs = require('../../commons/configs');
const logger = require('../../loaders/winston');

class AuthService {
  constructor() {
    /**
     * @type {FirebaseFirestore.Firestore}
     */
    const db = Container.get(DI_KEYS.FB_DB);
    this.userCollection = db.collection('users');
  }

  normalizePhoneNumber(phoneNumber) {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (digits.startsWith('84') && digits.length === 11) {
      return `0${digits.slice(2)}`;
    }
    return digits;
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) {
      return false;
    }

    const [salt, hash] = storedHash.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    const candidateBuffer = crypto.scryptSync(password, salt, 64);

    if (hashBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
  }

  sanitizeUser(userDoc) {
    const { passwordHash, ...safeUser } = userDoc;
    return safeUser;
  }

  /**
   * @param {Partial<User>} data
   * @returns
   */
  async signup(data) {
    try {
      const normalizedPhoneNumber = this.normalizePhoneNumber(data.phoneNumber);
      const password = String(data.password || '');

      if (!normalizedPhoneNumber || normalizedPhoneNumber.length !== 10 || !password) {
        throw new Error(MESSAGES.BAD_REQUEST);
      }

      const existedUserSnapshot = await this.userCollection
        .where('phoneNumber', '==', normalizedPhoneNumber)
        .limit(1)
        .get();

      if (!existedUserSnapshot.empty) {
        throw new Error(MESSAGES.BAD_REQUEST);
      }

      const userRef = this.userCollection.doc();

      const userData = {
        name: data.name || '',
        phoneNumber: normalizedPhoneNumber,
        address: data.address || '',
        avatarUrl: data.avatarUrl || null,
        dateOfBirth: data.dateOfBirth || null,
        citizenNumber: data.citizenNumber || '',
        fcmTokens: data.fcmTokens || [],
        sosNumbers: data.sosNumbers || [],
        passwordHash: this.hashPassword(password),
        createdAt: new Date(),
        lastSignInAt: new Date(),
      };

      await userRef.set(userData);

      const user = {
        id: userRef.id,
        ...this.sanitizeUser(userData),
      };

      return {
        accessToken: this.generateJwt(user),
        user,
      };
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * @param {{phoneNumber: string, password: string, fcmToken?: string}} payload
   */
  async signin(payload) {
    try {
      const normalizedPhoneNumber = this.normalizePhoneNumber(payload.phoneNumber);
      const password = String(payload.password || '');

      if (!normalizedPhoneNumber || !password) {
        throw new Error(MESSAGES.BAD_REQUEST);
      }

      const userSnapshot = await this.userCollection
        .where('phoneNumber', '==', normalizedPhoneNumber)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        throw new Error(MESSAGES.WRONG_USERNAME_OR_PASSWORD);
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      const isPasswordValid = this.verifyPassword(password, userData.passwordHash);
      if (!isPasswordValid) {
        throw new Error(MESSAGES.WRONG_USERNAME_OR_PASSWORD);
      }

      const fcmTokens = userData.fcmTokens || [];
      const { fcmToken } = payload;
      if (fcmToken && !fcmTokens.includes(fcmToken)) {
        fcmTokens.push(fcmToken);
      }

      await this.userCollection.doc(userDoc.id).update({
        fcmTokens,
        lastSignInAt: new Date(),
      });

      /**
       * @type {User}
       */
      const user = {
        id: userDoc.id,
        ...this.sanitizeUser(userData),
        fcmTokens,
        lastSignInAt: new Date(),
      };

      return {
        accessToken: this.generateJwt(user),
        user,
      };
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * @param {string} userId
   */
  async signout(userId, { fcmToken }) {
    try {
      const userDoc = await this.userCollection.doc(userId).get();
      const userData = userDoc.data();
      const fcmTokens = userData.fcmTokens || [];
      const index = fcmTokens.indexOf(fcmToken);
      if (index > -1) {
        fcmTokens.splice(index, 1);
      }

      await this.userCollection.doc(userId).update({
        fcmTokens,
      });

      return {
        id: userDoc.id,
        ...userData,
        fcmTokens,
      };
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   *
   * @param {User} user
   * @returns {string}
   * @private
   */
  generateJwt(user) {
    const payload = {
      user,
    };
    const token = jwt.sign(payload, configs.JWT_SECRET_KEY, {
      expiresIn: configs.JWT_EXPIRATION_TIME,
      algorithm: configs.JWT_ALGORITHM,
    });
    return token;
  }

  /**
   * @param {string} token
   * @returns {User | null}
   */
  async verifyAccessToken(token) {
    try {
      const decoded = await jwtVerify(token, configs.JWT_SECRET_KEY);

      return decoded.user;
    } catch (error) {
      return null;
    }
  }
}

module.exports = AuthService;
