const secret = process.env.SECRET || 'supersecret';
const env = process.env.NODE_ENV || 'dev';
const db = process.env.DB || 'mongodb://192.168.99.100:37017/dragon-api';

module.exports = {
  'secret': secret,
  'env': env,
  'db': db
};