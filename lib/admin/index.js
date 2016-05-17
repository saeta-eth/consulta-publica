/**
 * Module dependencies.
 */

var express = require('express');
var forumRouter = require('lib/forum-router');

/**
 * Exports Application
 */

var app = module.exports = express();

app.get(forumRouter('/admin'), require('lib/layout'));
app.get(forumRouter('/admin/forums'), require('lib/layout'));
app.get(forumRouter('/admin/forums/create'), require('lib/layout'));
app.get(forumRouter('/admin/topics'), require('lib/layout'));
app.get(forumRouter('/admin/topics/:id'), require('lib/layout'));
app.get(forumRouter('/admin/topics/create'), require('lib/layout'));
app.get(forumRouter('/admin/tags'), require('lib/layout'));
app.get(forumRouter('/admin/tags/:id'), require('lib/layout'));
app.get(forumRouter('/admin/tags/create'), require('lib/layout'));
app.get(forumRouter('/admin/users'), require('lib/layout'));
app.get(forumRouter('/admin/comments'), require('lib/layout'));
app.get(forumRouter('/admin/whitelists'), require('lib/layout'));
app.get(forumRouter('/admin/whitelists/create'), require('lib/layout'));
app.get(forumRouter('/admin/whitelists/:id'), require('lib/layout'));
