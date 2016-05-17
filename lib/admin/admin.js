/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import template from './admin-container.jade';
import Sidebar from '../admin-sidebar/admin-sidebar';
import TopicsListView from '../admin-topics/view';
import TopicForm from '../admin-topics-form/view';
import TagsList from '../admin-tags/view';
import TagForm from '../admin-tags-form/view';
import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';
import topicStore from '../topic-store/topic-store';
import page from 'page';
import o from 'component-dom';
import forumRouter from '../forum-router/forum-router';
import { findForum } from '../forum-middlewares/forum-middlewares';
import { findPrivateTopics, findTopic } from '../topic-middlewares/topic-middlewares';
import { findAllTags, findTag, clearTagStore } from '../tag-middlewares/tag-middlewares';
import { findAll as findAllForums, clearForumStore } from '../forum-middlewares/forum-middlewares.js';

page(forumRouter('/admin/*'),
  valid,
  findForum,
  user.required,
  user.hasAccessToForumAdmin,
  (ctx, next) => {
    let section = ctx.section;
    let container = render(template);

    // prepare wrapper and container
    o('#content').empty().append(container);

    // set active section on sidebar
    ctx.sidebar = new Sidebar(ctx.forum);
    ctx.sidebar.set(section);
    ctx.sidebar.appendTo(o('.sidebar-container', container)[0]);

    // Set page's title
    title();

    // if all good, then jump to section route handler
    next();
  }
);

page('/admin', ctx => {
  page.redirect('/admin/' + (config.multiForum ? 'forums' : 'topics'));
});

if(config.multiForum) {
  require('../admin-forums/admin-forums.js');
}

page(forumRouter('/admin/topics'), findPrivateTopics, ctx => {
  let currentPath = ctx.path;
  let topicsList = new TopicsListView(ctx.topics, ctx.forum);
  topicsList.replace('.admin-content');
  ctx.sidebar.set('topics');

  const onTopicsUpdate = () => { page(currentPath); };
  bus.once('topic-store:update:all', onTopicsUpdate);
  bus.once('page:change', () => {
    bus.off('topic-store:update:all', onTopicsUpdate);
  });
});

page(forumRouter('/admin/topics/create'), clearForumStore, findAllForums, clearTagStore, findAllTags, ctx => {
  ctx.sidebar.set('topics');
  // render new topic form
  let form = new TopicForm(null, ctx.forum, ctx.forums, ctx.tags);
  form.replace('.admin-content');
  form.once('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/topics/:id'), clearForumStore, findAllForums, clearTagStore, findAllTags, findTopic, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('topics');

  // render topic form for edition
  let form = new TopicForm(ctx.topic, ctx.forum, ctx.forums, ctx.tags);
  form.replace('.admin-content');
  form.on('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/tags'), clearTagStore, findAllTags, ctx => {
  const tagsList = new TagsList({
    forum: ctx.forum,
    tags: ctx.tags
  });

  tagsList.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/create'), ctx => {
  let form = new TagForm();
  form.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/:id'), findTag, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('tags');

  // render topic form for edition
  let form = new TagForm(ctx.tag);
  form.replace('.admin-content');
});

require('../admin-users/admin-users.js');

if (config.usersWhitelist) {
  require('../admin-whitelists/admin-whitelists.js');
  require('../admin-whitelists-form/admin-whitelists-form.js');
}

/**
 * Check if page is valid
 */

function valid(ctx, next) {
  let section = ctx.section = ctx.params[0];
  if (/forums|topics|tags|users|whitelists/.test(section)) return next();
  if (/forums|topics|tags|users|whitelists\/create/.test(section)) return next();
  if (/forums|topics|tags|users|whitelists\/[a-z0-9]{24}\/?$/.test(section)) return next();
}
