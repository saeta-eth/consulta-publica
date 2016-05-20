/**
 * Module dependencies.
 */

var express = require('express');
var forumRouter = require('lib/forum-router');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get(forumRouter('/consulta/:id'), require('lib/layout'));
