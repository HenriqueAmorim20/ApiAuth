const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
const User = require('../user/user.model');
const crypto = require('crypto');

const apiAuth = {

  async login(req, res, next) {
    const userRequest = req.body;
    try {
      const user = await User.findOne({ email: userRequest.email });
      const cipher = crypto.createCipheriv(
        config.crypto.algorithm,
        config.crypto.securitykey,
        config.crypto.initVector
      );
      let encryptedData = cipher.update(userRequest.senha, 'utf-8', 'hex');
      encryptedData += cipher.final('hex');

      if (user.senha === encryptedData) {
        const token = jwt.sign(
          { email: user.email },
          config.jwtSecret,
          { expiresIn: 43200 }
        );
        return res.json(token);
      }
      const err = new APIError(
        'Senha incorreta.',
        httpStatus.UNAUTHORIZED,
        true
      );
      return next(err);
    } catch (error) {
      const err = new APIError(
        'Email não encontrado.',
        httpStatus.NOT_FOUND,
        true
      );
      return next(err);
    }
  },

  async isAdmin(req, res, next) {
    try {
      const user = await User.findOne({ email: req.body.email });
      return res.json({
        isAdmin: user.email === config.email,
      });
    } catch (error) {
      const err = new APIError(
        'Email não encontrado.',
        httpStatus.NOT_FOUND,
        true
      );
      return next(err);
    }
  },

  async getAuthUser(req, res, next) {
    try {
      const user = await User.findOne({ email: req.user.email });
      return res.json({
        user: user,
      });
    } catch (error) {
      const err = new APIError(
        'Email não encontrado.',
        httpStatus.NOT_FOUND,
        true
      );
      return next(err);
    }
  },

  async recoverPassword(req, res, next) {
    // const data = {
    //   from: config.emailSender,
    //   to: req.body.email,
    //   subject: 'Recuperação de senha',
    //   text: 'Testing some Mailgun awesomeness!'
    // };
    try {
      const user = await User.findOne({ email: req.body.email });
      const token = jwt.sign(
        { email: user.email },
        config.jwtSecret,
        { expiresIn: 43200 }
      );
      const link = `${config.frontUrl}/recover/?token=${token}`;
      res.status(httpStatus.OK).json(link);
    } catch (error) {
      const err = new APIError(
        'Não foi possível enviar o email de recuperação. Email não cadastrado.',
        httpStatus.NOT_FOUND,
        true
      );
      next(err);
    }
  },

};

module.exports = apiAuth;
