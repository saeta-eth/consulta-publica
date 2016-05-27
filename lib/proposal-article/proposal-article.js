import view from '../view/mixin';
import Participants from '../participants-box/view.js';
import ProposalClauses from '../proposal-clauses/proposal-clauses.js';
import template from './template.jade';
import {toHTML} from '../proposal/body-serializer';

export default class ProposalArticle extends view('appendable', 'withEvents') {

  /**
   * Creates a new proposal-article view
   * from proposals object.
   *
   * @param {Object} proposal proposal's object data
   * @return {ProposalArticle} `ProposalArticle` instance.
   * @api public
   */

  constructor (topic) {
    super({
      template,
      locals: {
        topic,
        toHTML,
        clauses: getClauses(topic),
        baseUrl: window.location.origin
      }
    });

    this.onTitleClick = this.onTitleClick.bind(this);

    let participants = new Participants(topic.participants || []);
    participants.appendTo(this.el.querySelector('.participants'));
    participants.fetch();

    // Enable side-comments
    this.proposalClauses = new ProposalClauses(topic);
  }

  switchOn () {
    this.bind('click', '[data-title]', this.onTitleClick);

    this.bind('click', '.side-comment > .marker', this.onSideCommentActive.bind(this));
  }

  onTitleClick (evt) {
    const title = evt.delegateTarget || evt.target;
    if (!title) throw new Error('data-title element not found');
    const id = title.dataset.title;
    if (!id) throw new Error('data-title id not found');

    const children = this.el.querySelectorAll(`[data-parent-title="${id}"]`);
    Array.prototype.forEach.call(children, function (clause) {
      clause.classList.toggle('active');
    });

    title.classList.toggle('active');
  }

  onSideCommentActive () {
    const commentables = this.el.querySelectorAll('.commentable-section');

    for (let i = 0; commentables.length > i; i++) {
      commentables[i].classList.remove('side-comment-p-active');
    }

    const active = this.el.querySelector('.side-comment.active');
    if (active) active.parentNode.classList.add('side-comment-p-active');
  }
}

function getClauses (proposal) {
  var clauses = [];
  var titleId = 0;

  (proposal.clauses || []).forEach(function (clause) {
    if (clause.empty) return;
    var item = {dataset: {}};

    Object.assign(item, clause);

    item.isSectionTitle = isSectionTitle(item.markup);

    if (item.isSectionTitle) item.dataset.title = ++titleId;

    if (titleId && !item.isSectionTitle) {
      item.commentable = true;
      item.isSectionText = true;
      item.dataset.parentTitle = titleId;
    }

    clauses.push(item);
  });

  return clauses;
}

function isSectionTitle (markup) {
  return markup.includes('<span style="font-size: 26px;">');
}
