/**
 * Module dependencies.
 */

var config = require('lib/config');
var express = require('express');
var app = module.exports = express();

app.get('/ayuda', require('lib/layout'));
app.get('/ayuda/markdown', require('lib/layout'));
if (config.termsOfService) {
  app.get('/ayuda/terminos-y-condiciones', require('lib/layout'));
}
if (config.privacyPolicy) {
  app.get('/ayuda/privacidad', require('lib/layout'));
}
if (config.frequentlyAskedQuestions) {
  app.get('/ayuda/como-funciona', require('lib/layout'));
}
if (config.glossary) {
  app.get('/ayuda/glossary', require('lib/layout'));
}
if (config.aboutUs) {
  app.get('/ayuda/acerca', require('lib/layout'));
}