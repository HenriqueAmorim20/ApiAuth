const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);

module.exports = {

  listUser: {
    params: {
      pagina: Joi.number(),
      tamanhoPagina: Joi.number(),
      filtros: Joi.object(),
      campos: Joi.string()
    },
    query: {
    },
    body: {},
  },

  create: {
    params: {},
    query: {},
    body: {
      // url: Joi.string().required(),
    },
  },

  get: {
    // params: { idUser: Joi.objectId().required(), },
    query: {},
    body: {},
  },

  update: {
    // params: { idUser: Joi.objectId().required() },
    query: {},
    // body: { updates: Joi.array() },
  },

  remove: {
    // params: { idUser: Joi.objectId().required() },
    query: {},
    body: {},
  },

};
