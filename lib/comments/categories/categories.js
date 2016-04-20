import view from '../../view/mixin';
import bus from 'bus';
import values from 'values';
import template from './template.jade';

export default class Category extends view('appendable', 'removeable', 'withEvents') {
  constructor (options) {
    options.template = template;
    options.locals = values;
    super(options);

    this.onCategoryClick = this.onCategoryClick.bind(this);
  }

  switchOn () {
    this.bind('click', '[data-category]', this.onCategoryClick);
  }

  onCategoryClick (e) {
    bus.emmit('comments-by-category', e.getAttribute('data-category'));
  }
}
