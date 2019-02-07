import React, { Component } from 'react'
import qs from 'query-string';

export class Comments extends Component {
  componentDidMount() {
    const { TALK_ROOT_URL = 'http://127.0.0.1:3001' } = process.env;

    const script = document.createElement('script');
    script.src = `${TALK_ROOT_URL}/static/embed.js`;
    script.addEventListener('load', function () {
      Coral.Talk.render(document.getElementById('coral_talk_stream'), {
        talk: `${TALK_ROOT_URL}`
      });
    });
    document.body.appendChild(script);
  }

  render () {
    return (
      <div id="coral_talk_stream"></div>
    )
  }
}

export default Comments
