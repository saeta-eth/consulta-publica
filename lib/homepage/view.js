import view from '../view/mixin';
import template from './template.jade';
import scroll from 'scroll';

let showed = false;

export default class HomeView extends view('appendable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
    super(options);

    this.scrollToElement = this.scrollToElement.bind(this);
  }

  switchOn () {
    if (showed) this.el.classList.add('already-showed');
    showed = true;
    this.bind('click', '[href^="#"], [href^="#"] > *', this.scrollToElement);
  }

  scrollToElement (evt) {
    const link = evt.delegateTarget || evt.target;
    const target = this.el.querySelector(link.getAttribute('href'));
    if (!target) return;
    evt.preventDefault();
    scroll.top(document.body, target.offsetTop - 100);
  }
}
