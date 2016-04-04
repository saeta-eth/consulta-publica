import marked from 'marked';
import View from '../view/view.js';
import md from './about-us.md';
import template from './template.jade';

export default class AboutUsView extends View {

  /**
   * Creates a About Us view
   */

  constructor () {
    super(template, { md: marked(md) });
  }
}
