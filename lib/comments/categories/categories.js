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

    this.onCategoryClick = this.onCategoryClick.bind(this);

    this.switchOn();
  }

  switchOn () {
    this.bind('click', '[data-category]', this.onCategoryClick);
  }

  onCategoryClick (e) {
    log('click on category triggering bus event');
    bus.emit('comments:category-filter:change', e.currentTarget.getAttribute('data-category'));
  }
}
