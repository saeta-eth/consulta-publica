import o from 'component-dom';
import debug from 'debug';
import markdown from 'marked';
import t from 't-component';
import user from '../../user/user';
import config from '../../config/config';
import View from '../../view/view';
import commentStore from '../store/comment-store';
import CommentsEditView from './edit/view';
import CommentsRepliesView from './replies/view';
import CommentVote from './vote/view';
import template from './template.jade';

let log = debug('democracyos:comments-view');

export default class CommentCard extends View {
  constructor (comment) {
    super();
    this.comment = comment;
    this.setLocals();
    super(template, this.locals);
    this.initializeVote();
    this.editButton = this.find('.edit-comment');
    this.mediaBody = this.find('.comment-panel');

  }

  switchOn () {
    this.bind('click', '.flag', 'onflag');
    this.bind('click', '.btn-edit', 'onedit');
    this.bind('click', '.delete-comment', 'onremove');
    this.bind('click', 'a.cancel-remove', 'oncancelremove');
    this.bind('click', 'a.confirm-remove', 'onconfirmremove');
    this.bind('click', 'span.show-spam a', 'onshowspam');
    this.bind('click', '.btn.reply-counter', 'toggleReply');
    this.bind('click', '.new-reply', 'toggleReplyForm');


    jQuery(this.find('.comment-text')[0]).readmore({
      speed: 300,
      collapsedHeight: 200,
      moreLink: '<a class="more-link" href="#" title="' + t('comments.read-more') + '"><i class="fa fa-lg fa-chevron-circle-down"></i>&nbsp;' + t('comments.read-more') + '</a>',
      lessLink: '<a class="more-link" href="#" title="' + t('comments.read-less') + '"><i class="fa fa-lg fa-chevron-circle-up"></i>&nbsp;' + t('comments.read-less') + '</a>',
      afterToggle: function(trigger, element, expanded) {
        if(expanded) { // The "Close" link was clicked 
          element[0].style.height = element.children()[0].offsetHeight + 'px';
        }
      }
    });

    if( config.showCommentsReplies ) this.toggleReply();
  }

  switchOff () {
    if (this.commentsRepliesView) {
      this.commentsRepliesView.off('post', this.bound('newreply'));
      this.commentsRepliesView.off('delete', this.bound('removereply'));
    }
  }

  setLocals () {
    let locals = {};
    let comment = locals.comment = this.comment;
    locals.markdown = markdown;
    locals.flags = !!~comment.flags.map(function(v) { return v.author; }).indexOf(user.id);
    locals.own = comment.author.id === user.id;
    locals.repliesCounter = comment.replies.length;
    if (config.spamLimit) {
      locals.spam = comment.flags.length > config.spamLimit;
    } else {
      locals.spam = comment.flags.length > (comment.upvotes.length - comment.downvotes.length);
    }
    locals.avatar = comment.author.avatar;
    locals.classes = [];
    if (locals.own) locals.classes.push('own');
    if (locals.spam) locals.classes.push('spam');
    this.locals = locals;
  }

  initializeVote () {
    this.commentVote = new CommentVote(this.comment);
    this.el.find('.media-left').prepend(this.commentVote.render());
    this.commentVote.on('error', this.bound('voteError'));
    this.commentVote.on('loginrequired', this.bound('loginRequired'));
  };

  voteError (message) {
    message = message || '';
    this.find('.error')
      .css('display', 'block')
      .html(message);
  };

  loginRequired () {
    this.find('.loginrequired').css('display', 'block');
  }

  onflag (ev) {
    ev.preventDefault();

    let comment = this.comment;
    let target = this.find('.flag');
    let flagging = !this.locals.flags;

    target.toggleClass('selected');

    let title = t(flagging ? 'comment-card.not-spam' : 'comment-card.report-spam');
    target.attr('title', title);

    let flagsCounter = comment.flags.length + (flagging ? 1 : -1);
    let spam;
    if (config.spamLimit) {
      spam = flagsCounter > config.spamLimit;
    } else {
      spam = flagsCounter > (comment.upvotes.length - comment.downvotes.length);
    }
    if (spam) {
      this.el.addClass('spam');
    } else {
      this.el.removeClass('spam');
    }

    commentStore
      .flag(this.comment.id, flagging ? 'flag' : 'unflag')
      .then(() => {
        log('successfull %s as spam %s', flagging ? 'flag' : 'unflag', this.comment.id);
        let count = target.find('.count');
        let innerCount = '' !== count.html() ? parseInt(count.html()) : 0;
        innerCount += (flagging ? 1 : -1);
        count.html(innerCount ? innerCount : '');
        this.locals.flags = flagging;
      })
      .catch(err => {
        log('Fetch response error: %s', err);
        if (flagging) this.el.removeClass('spam');
        return target.removeClass('selected');
      });
  }

  onshowspam (ev) {
    ev.preventDefault();
    this.el.removeClass('spam');
  }

  onedit (ev) {
    ev.preventDefault();
    let form = this.mediaBody.find('.comment-edit-form');

    if (!form.length) {
      let commentsEdit = this.commentsEdit = new CommentsEditView(this.comment);
      commentsEdit.appendTo(this.find('.comment-form')[0]);
      commentsEdit.on('put', this.onsuccessedit.bind(this));
      commentsEdit.on('remove', this.oncanceledit.bind(this));
    }

    this.mediaBody.addClass('edit');
    o(this.find('.comment-form textarea')[0]).focus();
  }


  oncanceledit () {
    this.mediaBody.removeClass('edit');
  }

  onsuccessedit (data) {
    let commentText = this.find('.comment-text');
    let commentTime = this.find('.ago')[0];
    let edited = this.find('.edited');

    commentText.html(markdown(data.text));

    if (!edited.length) {
      let small = o('<small></small>');
      small.addClass('edited');
      small.html(' · ' + t('comments.edited'));
      commentTime.parentNode.insertBefore(small[0], commentTime.nextSibling);
    }

    this.mediaBody.removeClass('edit');
    this.commentsEdit.remove();

    this.comment.text = data.text;
    this.comment.editedAt = data.editedAt;
  }

  onremove (ev) {
    ev.preventDefault();
    this.el.addClass('remove');
    this.editButton.removeClass('hide');
    this.mediaBody.removeClass('edit');
  }

  oncancelremove (ev) {
    ev.preventDefault();
    this.el.removeClass('remove');
  }


  /**
   * Confirm comment removal
   *
   * @param {Event} ev
   * @api private
   */

  onconfirmremove (ev) {
    ev.preventDefault();

    this.el.removeClass('remove');
    var messageEl = this.find('.oncomment.message');
    messageEl.css('display', 'block');

    commentStore
      .destroy(this.comment.id)
      .then(() => {
        log('successfull destroyed %s', this.comment.id);
        messageEl.html(t('comments.removed'));
        setTimeout(() => {
          this.el.remove();
          this.emit('delete', this.comment);
        }, 2500);
      })
      .catch(err => {
        messageEl.html(err);
      });
  }

  /**
   * Show comment replies
   */

  onreplyclick (ev) {
    if(ev) ev.preventDefault();
    let repliesContainer = this.find('.replies-container');
    repliesContainer.empty().toggleClass('no-hide');
    if (repliesContainer.hasClass('no-hide')) {
      let commentsRepliesView = this.commentsRepliesView = new CommentsRepliesView(this.comment);
      commentsRepliesView.appendTo(repliesContainer[0]);
      commentsRepliesView.on('post', this.bound('newreply'));
      commentsRepliesView.on('delete', this.bound('removereply'));
      commentsRepliesView.on('remove', this.bound('cancelreply'));
    }
  }

  /**
   * Show comment replies
   */

   toggleReply (ev){
     if(ev) ev.preventDefault();
     let repliesContainer = this.find('.replies-container');
     repliesContainer.empty().toggleClass('active');
     if (repliesContainer.hasClass('active')) {
       let commentsRepliesView = this.commentsRepliesView = new CommentsRepliesView(this.comment);
       commentsRepliesView.appendTo(repliesContainer[0]);
       commentsRepliesView.on('post', this.bound('newreply'));
       commentsRepliesView.on('delete', this.bound('removereply'));
       commentsRepliesView.on('remove', this.bound('cancelreply'));
     }
   }

   toggleReplyForm (ev) {
     if (!this.find('.replies-container').hasClass('active')) this.toggleReply(ev);
     if(this.commentsRepliesView) {
       this.commentsRepliesView.toggleForm(ev);
     }
   }

  /**
   * New reply submitted
   */

  newreply () {
    let replyCounter = this.find('span.reply-counter');
    let counter = '' !== replyCounter.html() ? parseInt(replyCounter.html()) : 0;
    this.find('.comment-action.delete-comment').addClass('hide');
    counter += 1;
    replyCounter.html(counter);
  }

  /**
   * Cancel reply
   */

  cancelreply () {
    this.find('.replies-container').removeClass('no-hide').removeClass('active');
  }

  /**
   * Reply deleted
   */

  removereply () {
    let replyCounter = this.find('span.reply-counter');
    let counter = '' !== replyCounter.html() ? parseInt(replyCounter.html()) : 0;
    let btnRemove = this.find('.comment-action.delete-comment');
    counter -= 1;
    if (!counter) {
      btnRemove.removeClass('hide');
      replyCounter.html('');
    } else {
      replyCounter.html(counter);
    }
  }
}
