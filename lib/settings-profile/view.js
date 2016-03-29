import debug from 'debug';
import t from 't-component';
import user from '../user/user.js';
import FormView from '../form-view/form-view';
import template from './template.jade';
import config from '../config/config';

let log = debug('democracyos:settings-profile');

export default class ProfileForm extends FormView {

  /**
   * Creates a profile edit view
   */

  constructor () {
    super(template);
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'));


    // Locales

    this.locales = this.find('select#locale')[0];

    config.availableLocales.forEach((locale) => {
      var option = document.createElement('option');
      option.value = locale;
      option.innerHTML = t(`settings.locale.${locale}`);
      this.locales.appendChild(option);
    });

    this.locales.value = user.locale || config.locale;
    var selected = this.find(`select#locale option[value="${this.locales.value}"]`);
    selected.attr('selected', true);

    // Locations

    this.locations = this.find('select#location')[0];

    if (this.locations) {
      for (var i = 1; 10 >= i; i+=1) {
        var option = document.createElement('option');
        option.value = i;
        option.innerHTML = t(`settings.location.${i}`);
        this.locations.appendChild(option);
      }

      console.log(user.location);

      if(user.location) {
        this.locations.value = user.location;
        var selectedLocations = this.find(`select#location option[value="${this.locations.value}"]`);
        console.log(selectedLocations);
        selectedLocations.attr('selected', true);
      } else {
        var selectedLocations = this.find(`select#location option[value="0"]`);
        console.log(selectedLocations);
        selectedLocations.attr('selected', true);
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

      if(user.age) {
        this.ages.value = user.age;
        var selectedAge = this.find(`select#age option[value="${this.ages.value}"]`);
        selectedAge.attr('selected', true);
      } else {
        var selectedAge = this.find(`select#age option[value="0"]`);
        selectedAge.attr('selected', true);
      }
    }

  }

  /**
   * Turn off event bindings
   */

  switchOff () {
    this.off();
  }

  /**
   * Handle `error` event with
   * logging and display
   *
   * @param {String} error
   * @api private
   */

  onsuccess () {
    log('Profile updated');
    user.load('me');

    user.once('loaded', () => {
      this.find('img').attr('src', user.profilePicture());
      this.messages([t('settings.successfuly-updated')], 'success');

      if (user.locale && user.locale !== config.locale) {
        setTimeout(function(){
          window.location.reload();
        }, 10);
      }
    });
  }

  /**
   * Sanitizes form input data. This function has side effect on parameter data.
   * @param  {Object} data
   */

  postserialize (data) {
    data.firstName = data.firstName.trim().replace(/\s+/g, ' ');
    data.lastName = data.lastName.trim().replace(/\s+/g, ' ');
  }
}
