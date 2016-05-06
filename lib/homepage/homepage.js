import bus from 'bus';
import page from 'page';
import dom from 'component-dom';
import user from '../user/user';
import visibility from '../visibility/visibility';
import forumRouter from '../forum-router/forum-router';
import { findForum } from '../forum-middlewares/forum-middlewares';
import { findTopics, clearTopicStore } from '../topic-middlewares/topic-middlewares';
import HomeView from './view';
import topicFilter from '../topic-filter/topic-filter';

page(forumRouter('/'),
  init,
  clearTopicStore,
  user.optional,
  visibility,
  findForum,
  findTopics,
  render
);

function init (ctx, next) {
  document.body.classList.add('newsfeed');
  ctx.content = document.querySelector('#content');
  dom(ctx.content).empty();
  bus.once('page:change', () => document.body.classList.remove('newsfeed'));
  next();
}

function render (ctx) {
  new HomeView({
    container: ctx.content,
    locals: {
      topics: topicFilter.filter(ctx.topics)
    }
  });

  bus.emit('page:render');
}