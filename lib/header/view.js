import debug from 'debug';
import o from 'component-dom';
// import Headroom from 'democracyos-headroom.js';
import user from '../user/user.js';
import isMobile from '../is-mobile/is-mobile.js';
import config from '../config/config.js';
import template from './template.jade';
import UserBadge from '../user-badge/view.js';
import View from '../view/view.js';

let log = debug('democracyos:header:view');

/**
 * Expose HeaderView
 */

export default class HeaderView extends View {
  constructor () {
    super(template);
    this.user = this.el.find('.user');
  }

  switchOn () {
    var self = this;

    user.on('loaded', function () {
      var userBadge = new UserBadge();
      userBadge.replace(self.user);
      self.el.find('.anonymous-user').addClass('hide');
    });

    user.on('unloaded', function () {
      self.user.empty();
      self.el.find('.anonymous-user').removeClass('hide');
    });
  }

  switchOff () {
    user.off('loaded');
    user.off('unloaded');
  }
}
