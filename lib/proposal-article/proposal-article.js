import View from '../view/view.js';
import Participants from '../participants-box/view.js';
import ProposalClauses from '../proposal-clauses/proposal-clauses.js';
import template from './template.jade';
import {toHTML} from '../proposal/body-serializer';

export default class ProposalArticle extends View {

  /**
   * Creates a new proposal-article view
   * from proposals object.
   *
   * @param {Object} proposal proposal's object data
   * @return {ProposalArticle} `ProposalArticle` instance.
   * @api public
   */

  constructor (proposal) {
    super(template, {
      proposal: proposal,
      clauses: getClauses(proposal),
      baseUrl: window.location.origin,
      toHTML: toHTML
    });

    let participants = new Participants(proposal.participants || []);
    participants.appendTo(this.find('.participants')[0]);
    participants.fetch();

    // Enable side-comments
    this.proposalClauses = new ProposalClauses(proposal);
  }
}

function getClauses (proposal) {
  var clauses = [];
  var sectionAppeared = false;

  (proposal.clauses || []).forEach(function (clause) {
    if (clause.empty) return;
    var item = {};

    Object.assign(item, clause);

    item.isSectionTitle = isSectionTitle(item.markup);

    if (item.isSectionTitle) sectionAppeared = true;
    if (sectionAppeared && !item.isSectionTitle) item.commentable = true;

    clauses.push(item);
  });

  return clauses;
}

function isSectionTitle (markup) {
  return markup.startsWith('<div><span style="font-size: 26px;">');
}
