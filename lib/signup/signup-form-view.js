import t from 't-component';
import title from '../title/title.js';
import FormView from '../form-view/form-view.js';
import template from './signup-form.jade';

export default class SignupForm extends FormView {

  /**
   * Proposal Comments view
   *
   * @return {SignupForm} `SignupForm` instance.
   * @api public
   */

  constructor (reference) {
    super(template, { reference: reference });
  }

  switchOn () {
    this.on('success', this.bound('showSuccess'));

    // Locations

    this.locations = this.find('select#location')[0];

    if (this.locations) {
      for (var i = 1; 10 >= i; i+=1) {
        var option = document.createElement('option');
        option.value = i;
        option.innerHTML = t(`settings.location.${i}`);
        this.locations.appendChild(option);
      }
    }

    // Age

    this.ages = this.find('select#age')[0];

    if (this.ages) {
      for (var i = 1; 14 >= i; i+=1) {
        var option = document.createElement('option');
        option.value = i;
        option.innerHTML = t(`settings.age.${i}`);
        this.ages.appendChild(option);
      }
    }

  }

  /**
   * Show success message
   */

  showSuccess () {
    let form = this.find('#signup-form');
    let success = this.find('#signup-message');
    let welcomeMessage = this.find('#signup-message h1');
    let firstName = this.get('firstName');
    let lastName = this.get('lastName');
    let email = this.get('email');
    let fullname = firstName + ' ' + lastName;
    let message = t('signup.welcome', { name: fullname });

    analytics.track('signup', {
      email,
      firstName,
      lastName
    });

    title(t('signup.complete'));
    welcomeMessage.html(message);
    form.addClass('hide');
    success.removeClass('hide');
  }
}
