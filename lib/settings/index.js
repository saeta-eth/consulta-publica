/**
 * Module dependencies.
 */

var express = require('express');
var config = require('lib/config');

/**
 * Exports Application
 */

var app = module.exports = express();

function redirect(req, res) {
  var path = req.params.path || '';
  var url = config.settingsUrl + (path ? '/' + path : '');
  res.redirect(url);
}

if (config.settingsUrl) {
  app.get('/ajustes', redirect);
  app.get('/ajustes/:path', redirect);
}

app.get('/ajustes', require('lib/layout'));
app.get('/ajustes/perfil', require('lib/layout'));
app.get('/ajustes/'+encodeURIComponent('contraseña'), require('lib/layout'));
app.get('/ajustes/notificaciones', require('lib/layout'));
app.get('/ajustes/forums', require('lib/layout'));
