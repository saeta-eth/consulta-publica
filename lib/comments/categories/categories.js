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

  activate(name){
    var siblings = document.querySelectorAll('ul.categories li[data-category]');
    var active = document.querySelector('ul.categories li[data-category='+name+']');
    if(!active){
      log('error: activate comment category');
      return;
    }
    for(var i = 0; i < siblings.length; i++){
      siblings[i].style.background = 'transparent';
      siblings[i].style.color = siblings[i].getAttribute('data-color');
    }

    active.style.background = active.getAttribute('data-color');
    active.style.color = 'white';
  }

  select(name){
    this.activate(name);
    bus.emit('comments:category-filter:change', name);
  }

  onCategoryClick (e) {
    select(e.delegateTarget.getAttribute('data-category'))
  }
}