/**
 * Module Dependencies
 */

import dom from 'component-dom';
import Trianglify from 'trianglify';
import view from '../../view/mixin';
import template from './template.jade';

const palette = {
  amarilloPro: ['#BC0C1D', '#CE0D20', '#E20512', '#BC0C1D', '#CE0D20', '#E20512']
};

export default class ForumCard extends view('appendable') {
  constructor(options = {}) {
    options.template = template;
    options.locals = { forum: options.forum };
    super(options);

    this.forum = options.forum;

    requestAnimationFrame(this.renderBackground.bind(this), 0);
  }

  renderBackground() {
    let l = this.forum.id.length;
    const opts = {
      seed: parseInt(this.forum.id.slice(l - 9, l - 1), 16),
      palette: palette
    };

    var pattern = new Trianglify(opts);
    var cover = this.el.querySelector('.cover');
    dom(cover).css('background-image', `url(${pattern.png()})`);
  }
}
