const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const ObjectId = mongoose.Types.ObjectId;
/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.index({ email: 1 }, { unique: true });

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  /**
   * Lista users
   * @param {number} pagina - Numero da pagina atual.
   * @param {number} tamanhoPagina - Numero de patentes por pagina.
   * @param {*} filtros - JSON no formato de um filtro de projecao.
   * @param {Array} campos - Campos que devem ser projetados.
   * @returns {Promise<users[]>}
   */
  async list({
    pagina = 0,
    tamanhoPagina = 20,
    filtros = {},
    campos = []
  } = {}) {
    const mongoQuery = {};
    let mongoProjection = {};

    if (filtros !== {} && typeof filtros === 'object') {
      Object.keys(filtros).forEach((keyFiltro) => {
        mongoQuery[keyFiltro] = filtros[keyFiltro];
      });
    }

    if (Array.isArray(campos) && campos.length > 0) {
      mongoProjection = {};
      campos.forEach((field) => {
        mongoProjection[field] = 1;
      });
    }

    try {
      const count = await this.find(mongoQuery).count().exec();
      let limit = count;
      if (!limit) {
        limit = 1;
      }
      const users = await this
        .find(mongoQuery, mongoProjection)
        .skip(pagina * tamanhoPagina)
        .limit(+tamanhoPagina ? +tamanhoPagina : limit)
        .exec();
      return { users, count };
    } catch (error) {
      throw error;
    }
  },

  async updateUser({
    idUser,
    updates
  } = {}) {
    const _idUser = new ObjectId(idUser);
    const updateQuery = {};

    updates.updates.forEach((update) => {
      updateQuery[update.chave] = update.valor;
    });

    try {
      const result = await this.findOneAndUpdate(
        { _id: _idUser },
        { $set: updateQuery },
        { new: true }
      ).exec();
      if (!result) throw new APIError('N??o existe Users com esse identificador', httpStatus.NOT_FOUND);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
