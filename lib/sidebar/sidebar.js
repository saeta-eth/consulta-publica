import bus from 'bus';
import dom from 'component-dom';
import equals from 'mout/object/equals';
import '../topic-filter/topic-filter';
import view from '../view/mixin';
import template from './template.jade';
import List from './list/list';
import FilterView from './filter/filter';
import forumTitleTemplate from './forum-title/template.jade';

class Sidebar extends view('appendable') {
  constructor (options = {}) {
    options.template = template;
    super(options);

    this.refresh = this.refresh.bind(this);

    this.forumViewShowing = null

    this.refresh();
    this.switchOn();
  }

  switchOn () {
    bus.on('topic-filter:update', this.refresh);
  }

  switchOff () {
    bus.off('topic-filter:update', this.refresh);
  }

  refresh (items, filter) {
    this.refreshList(items);
    this.refreshFilter(filter);
    if (items && items.length && items[0].forum) {
      this.refreshForumView(items[0].forum);
    } else {
      this.refreshForumView();
    }
  }

  refreshList (items) {
    if (!this.list) {
      this.list = new List({
        container: this.el.querySelector('[data-sidebar-list]')
      });
    }

    this.list.reset(items);
  }

  refreshFilter (filter) {
    if (this.filterView) {
      if (equals(this.filterView.options.locals, filter)) return;
      this.filterView.remove();
    }
    if (filter) {
      this.filterView = new FilterView({
        container: this.el.querySelector('[data-sidebar-filter]'),
        filter: filter
      });
    }
  }

  refreshForumView (forum) {
    if (!this.forumView) {
      this.forumView = this.el.querySelector('[data-forum-title]')
    }

    if (this.forumViewShowing && forum) {
      if (this.forumViewShowing.id === forum.id) return
    }

    if (this.forumViewShowing) {
      this.forumViewShowing = null
      dom(this.forumView).empty()
    }

    if (!forum) return

    this.forumView.innerHTML = forumTitleTemplate({forum})
    this.forumViewShowing = forum
  }

  select (id) {
    this.list.select(id);
  }
}

const sidebar = new Sidebar({
  container: document.body
});

export default sidebar;
