/**
 * Module dependencies.
 */

import List from 'democracyos-list.js';
import ListFuzzySearch from 'list.fuzzysearch.js';
import template from './template.jade';
import View from '../view/view.js';
import t from 't-component';
import o from 'component-dom';
import request from '../request/request.js';
import config from '../config/config.js';
import closest from 'component-closest';
import removeAll from 'mout/array/removeAll';

/**
 * Creates a list view of users
 */

export default class UsersListView extends View {
  constructor(options = {}) {
    super(template, options);
    this.options = options;
  }

  switchOn() {
    this.list = new List('users-wrapper', { valueNames: ['lastName', 'fullName', 'createdAt', 'email', 'elected', 'city', 'ambassador', 'staff', 'id'] });

    this.searchForm = this.find('input.search');
    this.bind('click', '.filter.staff', this.bound('filterByStaff'));
    this.bind('click', '.filter.elected', this.bound('filterByElected'));
    this.bind('click', '.filter.city', this.bound('filterByCity'));
    this.bind('click', '.filter.ambassador', this.bound('filterByAmbassador'));

    this.bind('click', '.f-status', this.bound('toggleStatus'));
    this.bind('click', '[data-role]', this.bound('toggleRole'));
  }

  filter(value){
    this.list.search(value);
    this.searchForm.val(value);
    this.searchForm.focus();
  }

  filterByStaff(){
    this.filter(t('admin-users.list.staff'));
  }

  filterByElected(){
    this.filter(t('settings.role.elected'));
  }

  filterByCity(){
    this.filter(t('settings.role.city'));
  }

  filterByAmbassador(){
    this.filter(t('settings.role.ambassador'));
  }

  toggleStatus(ev){
    let target = ev.delegateTarget || closest(ev.target, 'a');
    let userEl = closest(target, '.list-group-item[data-id]');
    target = o(target);
    let id = userEl.getAttribute('data-id');
    let user = this.options.users.find(i => i.id === id);
    user.status = 'active' === user.status ? 'disabled' : 'active';
    var data = { status: user.status };

    this.toggle(target, user, data);
  }

  toggleRole(ev){
    let target = ev.delegateTarget || closest(ev.target, '[data-role]');
    let role = target.getAttribute('data-role');
    let userEl = closest(target, '.list-group-item[data-id]');
    target = o(target);
    let id = userEl.getAttribute('data-id');
    let user = this.options.users.find(i => i.id === id);

    if (user.roles.includes(role)) {
      removeAll(user.roles, role);
    } else {
      user.roles.push(role);
    }

    var data = { roles: user.roles };

    this.toggle(target, user, data);
  }

  toggle(target, user, data){

    let list = this.list;

    target.toggleClass('off').toggleClass('on');

    if( !target.find('.ok').hasClass('hide') ){
      target.find('.ok').addClass('hide');
    }
    if( !target.find('.ko').hasClass('hide') ){
      target.find('.ko').addClass('hide');
    }
    target.find('.refresh').removeClass('hide');

    request
    .post(config.subPath + '/settings/roles/' + user.id)
    .send(data)
    .end(function(err, res) {

      target.find('.refresh').addClass('hide');

      if (err || !res.ok) {
        target.toggleClass('off').toggleClass('on');
        target.find('.ko').removeClass('hide');
        return console.error(err);
      }
      target.find('.ok').removeClass('hide');


      // Refresh list
      var item = list.get('id', user.id)[0];
      console.log(item);
      item.values({
        status: user.status,
        roles: user.roles
      });
      list.update();

      // Refresh roles badges
      o(item.elm).find('.role').each((e)=>{e.remove();});
      user.roles.forEach(function(role,i){
        var badge = o('<span></span>');
        badge.addClass('badge');
        badge.addClass('role');
        badge.addClass(role);
        badge.html(t('settings.role.'+role));
        o(item.elm).find('h4').append(badge);
      });

    });
    // var item = this.list.get('id', id)[0];
    // console.log(item);
    // item.values({
    //   status: user.status,
    //   firstName: user.firstName + '0'
    // });
    // console.log('update');
    // this.list.update();
  }

}
