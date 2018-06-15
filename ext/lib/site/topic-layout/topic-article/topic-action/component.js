import React from 'react'
import Vote from 'lib/site/topic-layout/topic-article/vote/component'
import Poll from 'lib/site/topic-layout/topic-article/poll/component'
import Cause from 'lib/site/topic-layout/topic-article/cause/component'
import Slider from 'lib/site/topic-layout/topic-article/slider/component'
import Hierarchy from 'lib/site/topic-layout/topic-article/hierarchy/component'

export default ({ topic }) => (
  <div className='topic-article-content topic-article-action'>
    <h3 className='topic-action-title'>{'¿Star-Lord fue culpable de que Thanos alcanzara su objetivo?'}</h3>
    {!!topic.voted && topic.action.method === 'poll' &&
      <div className='topic-action-voted'>
        {topic.open &&
          <p>Ya votaste en la consulta</p>
        }
        <div>
          <span>Elegiste la opción:</span>
          <span className='option'>{topic.voted}</span>
        </div>
      </div>
    }
    {(() => {
      switch(topic.action.method) {
        case 'vote':
          return  <Vote topic={topic} />
        case 'poll':
          return  <Poll topic={topic} />
        case 'cause':
          return <Cause topic={topic} />
        case 'slider':
          return <Slider topic={topic} />
        case 'hierarchy':
          return <Hierarchy topic={topic} />
        }
    })()}
    {topic.closed &&
      <div className='action-count'>
        <div className='participantes' />
        <span className='number'>{topic.action.count}</span>
        <span>participantes</span>
      </div>
    }
  </div>
)
