import bus from 'bus';
import debug from 'debug';
import view from '../../view/mixin';
import values from './values';
import template from './template.jade';

let log = debug('democracyos:comments-category-view');

export default class Category extends view('appendable', 'removeable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
    options.locals = {categories: values};
    super(options);

    this.default = values[0];
    this.onCategoryClick = this.onCategoryClick.bind(this);
    this.bind('click', '[data-category]', this.onCategoryClick);
  }

  onCategoryClick (e) {
    bus.emit('comments:category-filter:change', e.delegateTarget.getAttribute('data-category'));
  }
}