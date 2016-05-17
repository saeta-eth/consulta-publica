import page from 'page';
import forumRouter from '../forum-router/forum-router';
import { dom } from '../render/render.js';
import template from './template.jade';

page(forumRouter('/admin/comments'), ctx => {
  const view = dom(template);
  ctx.content.innerHTML = '';
  ctx.content.appendChild(view);
  ctx.sidebar.set('comments');
});
