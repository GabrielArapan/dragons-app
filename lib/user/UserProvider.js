var User = require('./User');
const bcrypt = require('bcryptjs-then');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

  return {
    register,
    login,
    createUser,
    getUsers,
    getUser,
    deleteUser,
    putUser
  }

  function signToken(id) {
    return jwt.sign({ id: id }, app.config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
  }

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function register(req, res, next) {

    console.log(req.expressApp);

    if (
      !(req.body.password &&
        req.body.password.length >= 7)
    ) {
      return next(new HttpError(400, 'Password error. Password needs to be longer than 8 characters.'));
    }

    if (
      !(req.body.name &&
        req.body.name.length > 5 &&
        typeof req.body.name === 'string')
    ) return next(new HttpError(400, 'Username error. Username needs to longer than 5 characters'));

    if (
      !(req.body.email &&
        validateEmail(req.body.email) &&
        typeof req.body.name === 'string')
    ) return next(new HttpError(400, 'Email error. Email must have valid characters.'));

    return User.findOne({ email: req.body.email })
      .then(user => user ?
        Promise.reject(new HttpError(400, 'User with that email exists.')) :
        Promise.resolve())
      .then(bcrypt.hash.bind(this, req.body.password, 8))
      .then(hash => User.create({ name: req.body.name, email: req.body.email, password: hash }))
      .then(user => res.status(200).send({ auth: true, token: signToken(user._id) }))
      .catch(next);
  }

  function login(req, res, next) {

    const _user = {};
    return User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) return Promise.reject(new Error('User with that email does not exits.'));
        _user._id = user._id;
        return user.password;
      })
      .then(userPassword => bcrypt.compare(req.body.password, userPassword))
      .then(passwordIsValid => passwordIsValid
        ? signToken(_user._id)
        : Promise.reject(new Error('The credentials do not match.')))
      .then(token => res.status(200).send({ auth: true, token: token }))
      .catch(err => next(err));

  }

  function createUser(req, res, next) {
    return User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
      // .then(user => res.status(200).send(user))
      // .catch(err => next(new Error(err)));
      .then(user => user ?
        Promise.reject(new HttpError(400, 'User with that email exists.')) :
        Promise.resolve())
      .then(bcrypt.hash.bind(this, req.body.password, 8))
      .then(hash => User.create({ name: req.body.name, email: req.body.email, password: hash }))
      .then(user => res.status(200).send({ auth: true, token: signToken(user._id) }))
      .catch(next);
  }

  function getUsers(req, res, next) {
    return User.find({})
      .then(users => res.status(200).send(users))
      .catch(err => next(new Error(err)));
  }

  function getUser(req, res, next) {
    return User.findById(req.params.id)
      .then(user => {
        if (!user) return res.send(404).send('No user found.');
        res.status(200).send(user);
      })
      .catch(err => next(new Error(err)));
  }

  function deleteUser(req, res, next) {
    return User.findByIdAndRemove(req.params.id)
      .then(user => res.status(200).send(user))
      .catch(err => next(new Error(err)));
  }

  function putUser(req, res, next) {
    return User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.status(200).send(user))
      .catch(err => next(new Error(err)));
  }
};