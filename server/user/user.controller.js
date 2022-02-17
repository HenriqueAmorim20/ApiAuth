const User = require('./user.model');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const crypto = require('crypto');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');

const apiUser = {
  /**
   * Load user and append to req.
   */
  load(req, res, next, id) {
    User.get(id)
      .then((user) => {
        req.user = user; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => next(e));
  },

  /**
   * Get user
   * @returns {User}
   */
  get(req, res) {
    return res.json(req.user);
  },

  /**
   * Create new user
   * @property {string} req.body.nome - The name of user.
   * @property {string} req.body.senha - The password of user.
   * @property {string} req.body.email - The email of user.
   * @returns {User}
   */
  async create(req, res, next) {
    const user = new User(req.body);
    const cipher = crypto.createCipheriv(config.crypto.algorithm, config.crypto.securitykey, config.crypto.initVector);
    let encryptedData = cipher.update(user.senha, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    user.senha = encryptedData;
    try {
      await user.save();
      const token = jwt.sign(
        { email: user.email },
        config.jwtSecret,
        { expiresIn: 43200 }
      );
      res.status(httpStatus.CREATED).json(token);
    } catch (error) {
      next(new APIError(error.message, httpStatus.NOT_FOUND));
    }
  },

  // async createGoogle(req, res, next) {
  //   const user = new User(req.body);
  //   const cipher = crypto.createCipheriv(config.crypto.algorithm, config.crypto.securitykey, config.crypto.initVector);
  //   let encryptedData = cipher.update(user.email, 'utf-8', 'hex');
  //   encryptedData += cipher.final('hex');

  //   user.senha = encryptedData;
  //   try {
  //     const result = await user.save();
  //     res.status(httpStatus.CREATED).json(result);
  //   } catch (error) {
  //     next(new APIError(error.message, httpStatus.NOT_FOUND));
  //   }
  // },

  /**
   * Update existing user
   * @property {string} req.body.username - The username of user.
   * @property {string} req.body.senha - The password of user.
   * @returns {User}
   */
  async update(req, res, next) {
    const _idUser = req.params.userId;
    const updateFields = req.body;

    try {
      const status = await User.updateUser({ idUser: _idUser, updates: updateFields });
      res.status(httpStatus.OK).json(status);
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req, res, next) {
    let filtros = {};
    let result = {};
    let campos = [];

    const pagina = parseInt(req.query.pagina || 0, 10);
    const tamanhoPagina = Math.min(
      parseInt(req.query.tamanhoPagina || 20, 10),
      100
    );

    if (req.query.filtros) {
      try {
        filtros = JSON.parse(req.query.filtros);
      } catch (error) {
        next(
          new APIError(
            'Filtro mal formatado, esperado um json',
            httpStatus.BAD_REQUEST,
            true
          )
        );
      }
    }

    if (req.query.campos) {
      campos = req.query.campos.split(',');
    }

    try {
      result = await User.list({ pagina, tamanhoPagina, filtros, campos });
    } catch (error) {
      next(error);
    }

    res.setHeader('X-Total-Count', result.count);
    res.status(httpStatus.OK).json(result.users);
  },

  /**
   * Delete user.
   * @returns {User}
   */
  remove(req, res, next) {
    const user = req.user;
    user
      .remove()
      .then(deletedUser => res.json(deletedUser))
      .catch(e => next(e));
  }
};


module.exports = apiUser;
