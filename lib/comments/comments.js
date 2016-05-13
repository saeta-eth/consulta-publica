import o from 'component-dom';
import t from 't-component';
import debug from 'debug';
import loading from 'democracyos-loading-lock';
import isEmpty from 'mout/lang/isEmpty';
import bus from 'bus';
import user from '../user/user';
import config from '../config/config';
import FormView from '../form-view/form-view';
import analytics from '../analytics';
import CommentCard from './card/view';
import CommentsFilter from './filter/view';
import CommentsCategories from './categories/categories';
import CommentsCategoriesValues from './categories/values';
import commentStore from './store/comment-store';
import template from './template.jade';

let log = debug('democracyos:comments-view');

export default class CommentsView extends FormView {

  /**
   * Creates a CommentsView
   *
   * @param {String} reference
   */

  constructor (item, reference) {

    var categValFormInput = CommentsCategoriesValues.map(function(v) { return { label: v.title, value: v.name, color: v.color }});
    super(template, { item: item, reference: reference, categories: categValFormInput });
    this.item = item;

    this.page = 0;
    this.filter = new CommentsFilter();
    this.sort = this.filter.getSort();
    this.filter.appendTo(this.find('.filter-container')[0]);

    this.categories = new CommentsCategories();
    this.category = '';
    this.find('[data-categories-container]').replace(this.categories.el);

    this.author = '';

    this.comments = [];

    if(user.id){
      this.form = this.find('form.comment-form');
      this.textarea = this.form.find('textarea')[0];
    }
    // this.alias = this.form.find('input[name="alias"]');
    // this.asAlias = this.form.find('input[name="asAlias"]');
    // this.peopleCount = this.form.find('input[name="peopleCount"]');
  }

  initialize () {
    if(user.id)
      this.commentFormInit();
    this.initializeComments();
  }

  /**
   * Load initial set of comments
   *
   * @api public
   */

  initializeComments () {
    //this.categories.activate(this.category);

    this.page = 0;
    this.comments = [];
    this.find('btn.load-comments').addClass('hide');

    let query = {
      topicId: this.item.id,
      author: this.author || undefined,
      count: true,
      sort: this.sort,
      category: this.category
    };
    commentStore
      .findAll(query)
      .then(count => {
        this.count = count;
        this.fetch();
      })
      .catch(err => {
        log('Fetch error: %s', err);
        return;
      });
  }

  /**
   * Fetch comments
   *
   * @api public
   */

  fetch () {
    this.loadingComments();

    let query = {
      topicId: this.item.id,
      author: this.author,
      page: this.page,
      sort: this.sort,
      limit: config.commentsPerPage,
      category: this.category
    };

    commentStore
      .findAll(query)
      .then(comments => {
        this.unloadingComments();
        this.emit('fetch', comments);
      })
      .catch(err => {
        this.unloadingComments();
        log('Fetch error: %s', err);
      });
  }

  // refreshForm (){
  //   if( this.asAlias[0].checked && jQuery('.people-count-row').hasClass('hide') ) {
  //     jQuery('.people-count-row').removeClass('hide');
  //   } else if ( !this.asAlias[0].checked && !jQuery('.people-count-row').hasClass('hide')) {
  //     jQuery('.people-count-row').addClass('hide');
  //   }
  // }

  switchOn () {
    this.bind('click', '.category', 'selectCategoryInput');
    this.bind('click', '.comments-own', 'toggleMyComments');
    this.bind('click', '.load-comments', 'fetch');
    this.bind('click', '.cancel-new-comment', 'commentFormInit');
    this.bind('click', '.new-comment', 'commentFormCategories')
    this.on('success', this.bound('onsuccess'));
    this.on('fetch', this.bound('load'));
    this.on('no more comments', this.nomorecomments.bind(this));
    this.on('more comments', this.morecomments.bind(this));
    this.filter.on('change', this.bound('onfilterchange'));

    bus.on('comments:category-filter:change', this.oncategorychange.bind(this));

    // this.alias.on('keyup', () => {
    //   jQuery('.comment-form').find('input[name="asAlias"]').prop('checked', !isEmpty(this.alias.value()));
    //   this.refreshForm();
    // });

    // this.asAlias.on('change', () => {
    //   this.refreshForm();
    // });

    // this.refreshForm();

  };

  switchOff () {
    this.filter.off('change', this.bound('onfilterchange'));
    bus.off('comments-by-category', this.fetchByCategory);
  };

  /**
   * Load comments in view's `el`
   *
   * @param {Array} comments
   * @api public
   */

  load (comments) {
    if( !comments.length ) return this.refreshState();

    log('load %o', comments);

    var els = this.find('.all-comments li.comment-item');

    this.add(comments);

    if (!this.page) {
      els.remove();
    }

    if (this.comments.length === this.count) {
      this.emit('no more comments');
    } else {
      this.emit('more comments');
    }

    this.refreshState();

    this.page += 1;
    this.emit('load');
  };

  refreshState(){

    if (!this.comments.length) {
      let span = o('<div></div>');
      let text = this.author !== '' ? t('comments.no-user-comments') : t('comments.no-comments');
      span.html(text).addClass('no-comments');
      let existing = this.find('.no-comments');
      if (existing.length) existing.remove();
      this.find('.comments-list').empty().append(span[0]);
      return this.emit('no more comments');
    }else{
      let existing = this.find('.no-comments');
      if (existing.length) existing.remove();
    }

  };

  add (comment) {
    var self = this;

    if (Array.isArray(comment)) {
      comment.forEach((c) => self.add(c));
      return;
    }

    var card = new CommentCard(comment);
    this.comments.push(comment);
    var container = this.find('.comments-list');

    card.appendTo(container);
    card.on('delete', function(){
      self.comments.splice(self.comments.indexOf(comment), 1);
      self.bound('refreshState')();
    });
  }

  onsuccess (res) {
    if(user.id)
      this.commentFormInit();
    this.categories.el.querySelector('[data-category=' + res.body.category + ']').click();
    this.add(res.body);
    this.track(res.body);
  }

  track(comment) {
    analytics.track('comment', {
      comment: comment.id
    });
  }

  /**
   * Display a spinner when loading comments
   *
   * @api public
   */

  loadingComments () {
    this.list = this.find('.all-comments')[0];
    this.loadingSpinner = loading(this.list, { size: 100 }).lock();
  }

  /**
   * Remove spinner when comments are loaded
   */

  unloadingComments () {
    this.loadingSpinner.unlock();
  }

  /**
   * When there are more comments to show
   *
   * @api public
   */

  morecomments () {
    this.find('.load-comments').removeClass('hide');
  }

  /**
   * When there are no more comments to show
   *
   * @api public
   */

  nomorecomments () {
    this.find('.load-comments').addClass('hide');
  }

  /**
   * When comments filter change,
   * re-fetch comments
   *
   * @api public
   */

  onfilterchange () {
    this.sort = this.filter.getSort();
    this.initializeComments();
  }

  /**
   * When comments category change,
   * re-fetch comments
   *
   * @api public
   */

  oncategorychange (category) {
    this.category = category;
    this.initializeComments();
  }

  /**
   * Toggle all comments / my comments
   *
   * @param event
   * @api public
   */

  toggleMyComments (e) {
    this.author = e.delegateTarget.querySelector('input').checked ? user.id : '';
    this.initializeComments();
  }

  /**
   * Select comment category input
   *
   * @param event
   * @api public
   */

  selectCategoryInput (evt) {
    const target = evt.delegateTarget;
    const category = target.getAttribute('data-category');
    const categoryInput = this.find('.categories-input input')[0];

    this.activateCategoryInput(category);

    if (categoryInput) {
      categoryInput.value = category;
    }

    if (this.find('.form-group:not(.categories-input)')[0].style.opacity === '0') {
      this.commentFormText();
    }
  }

  /**
   * Activate comment category input
   *
   * @param category name
   * @api public
   */

  activateCategoryInput (name) {
    const el = this.el[0];

    const current = el.querySelector('.categories-input .active[data-category]');

    if (current) {
      current.classList.remove('active');
    }

    const active = el.querySelector('.categories-input [data-category=' + name + ']');

    if (!active) {
      log('error: activate comment category input');
      return;
    }

    active.classList.add('active');
  }

  /**
   * Init comment form show new comment button
   *
   * @api public
   */

  commentFormInit () {
    var formChilds = this.form.find('.form-group');
    for (var i = 0; i < formChilds.length; i++) {
      formChilds[i].style.opacity = 0;
    }
    if (user.id) this.textarea.value = '';
    this.find('.new-comment')[0].style.opacity = 1;
    this.find('.new-comment')[0].style.zIndex = 1;
    this.activateCategoryInput(null);
  }

  /**
   * Show categories to select new comment
   *
   * @api public
   */

  commentFormCategories () {
    const el = this.el[0];
    let btn = el.querySelector('.new-comment');
    let checked = el.querySelector('.categories-input :checked');
    let input = el.querySelector('.categories-input');

    input.style.opacity = 1;
    btn.style.opacity = 0;
    btn.style.zIndex = 0;
    if (checked) checked.checked = false;
  }

  /**
   * Show textarea to create new comment
   *
   * @api public
   */

  commentFormText () {
    var formChilds = this.form.find('.form-group');
    for(var i = 0; i < formChilds.length; i++)
      formChilds[i].style.opacity = 1;
  };
}
