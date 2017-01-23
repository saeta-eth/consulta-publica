import t from 't-component'
import debug from 'debug'
import fetch from 'whatwg-fetch'
import AddUserInput from 'lib/admin/admin-permissions/add-user-input/add-user-input'
import FormView from '../../form-view/form-view'
import template from './template.jade'

let log = debug('democracyos:settings-password')

export default class UserBadgeView extends FormView {
  constructor () {
    super(template)
    this.onSelect = this.onSelect.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.addUserInput = new AddUserInput({
      onSelect: this.onSelect,
      container: this.el[0].querySelector('.user-search')
    })
  }

  onSelect (user) {
    this.selectedUser = user
    this.el[0].querySelector('.user-card').style.display = 'flex'
    this.el[0].querySelector('.picture').style.backgroundImage = 'url(' + user.avatar + ')'
    this.el[0].querySelector('.name').textContent = user.fullName
    if (user.badge) this.el[0].querySelector('input[name="badge"]').value = user.badge
    return Promise.resolve()
  }

  setBadge (badge) {
    return fetch('/api/settings/badges', {
      method: 'POST',
      body: {
        id: this.selectedUser,
        badge
      }
    })
  }

  onSubmit (e) {
    console.log('submit', this.el, this.selectedUser)
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.el[0].querySelector('#submit-badge').addEventListener('click', this.onSubmit)
    this.on('success', this.onsuccess.bind(this))
    this.on('error', this.onerror.bind(this))
  }

  /**
   * Turn off event bindings
   */

  switchOff () {
    this.off()
  }

  /**
   * Handle `error` event with
   * logging and display
   *
   * @param {String} error
   * @api private
   */

  onsuccess () {
    log('Password updated')
    this.messages([t('settings.password-updated')], 'success')
  }

  /**
   * Handle current password is incorrect
   */

  onerror (response) {
    console.log('onerror')
    console.log(response.status)
    if (response.status === 403) {
      console.log(t('settings.password-invalid'))
      this.messages([t('settings.password-invalid')])
    }
  }

}