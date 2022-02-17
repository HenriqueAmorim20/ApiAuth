const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  CRYPTO_ALGORITHM: Joi.string().required().description('Algoritmo usado para criptografia.'),
  CRYPTO_KEY: Joi.string().required().description('Secret key usada para criptografia.'),
  CRYPTO_IV: Joi.string().required().description('Initial Vector usado para criptografia.'),
  ADMIN: Joi.string().required().description('Admin email'),
  FRONTURL: Joi.string().required().description('Url frontend'),
  EMAIL_SENDER: Joi.string().required().description('Sender of the emails'),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  crypto: {
    algorithm: envVars.CRYPTO_ALGORITHM,
    securitykey: envVars.CRYPTO_KEY,
    initVector: envVars.CRYPTO_IV
  },
  admin: envVars.ADMIN,
  frontUrl: envVars.FRONTURL,
  emailSender: envVars.EMAIL_SENDER
};

module.exports = config;
