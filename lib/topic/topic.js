import o from 'component-dom';
import bus from 'bus';
import debug from 'debug';
import page from 'page';
import title from '../title/title';
import { findTopics, findTopic } from '../topic-middlewares/topic-middlewares';
import { findForum } from '../forum-middlewares/forum-middlewares';
import sidebar from '../sidebar/sidebar';
import user from '../user/user';
import ProposalArticle from '../proposal-article/proposal-article';
import Options from '../proposal-options/proposal-options';
import Comments from '../comments/comments';
import forumRouter from '../forum-router/forum-router.js';

const log = debug('democracyos:topic:page');

export function show (topic) {
  window.analytics.track('view topic', { topic: topic.id });
  bus.emit('page:render', topic.id);

  const appContent = o('#content');

  sidebar.select(topic.id);

  // Clean page's content
  appContent.empty();

  // Build article's content container
  let article = new ProposalArticle(topic);
  article.appendTo(appContent[0]);

  // Build article's meta
  let options = new Options(topic);
  options.appendTo(appContent);

  // Build article's comments, feth them
  let comments = new Comments(topic, topic.url);
  log("comments", comments)
  comments.appendTo(appContent);
  comments.initialize();

  document.body.classList.add('topics-show');

  document.body.scrollTop = 0;

  bus.once('page:change', pagechange);
  function pagechange(url) {
    // restore page's original title
    title();

    // hide it from user
    appContent.empty();

    // scroll to top
    document.body.scrollTop = 0;
  }
}

page(forumRouter('/consulta/:id'), user.optional, findForum, findTopics, findTopic, (ctx, next) => {
  log(`rendering Topic ${ctx.params.id}`);

  if (!ctx.topic) {
    log('Topic %s not found', ctx.params.id);
    window.location = '/404';
    return next();
  }

  show(ctx.topic);

  title(ctx.topic.mediaTitle);

  log('render %s', ctx.params.id);
});
