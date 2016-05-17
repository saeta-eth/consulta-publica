/**
 * Module dependencies.
 */

import List from 'democracyos-list.js';
import template from './template.jade';
import View from '../view/view.js';

/**
 * Creates a list view of forums
 */

export default class ForumsListView extends View {
  constructor(options = {}) {
    super(template, options);
    this.options = options;
  }

  switchOn() {}
}
