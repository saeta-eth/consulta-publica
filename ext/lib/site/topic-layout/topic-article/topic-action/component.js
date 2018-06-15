import React from 'react'
import t from 't-component'
import Vote from 'lib/site/topic-layout/topic-article/vote/component'
import Poll from 'lib/site/topic-layout/topic-article/poll/component'
import Cause from 'lib/site/topic-layout/topic-article/cause/component'
import Slider from 'lib/site/topic-layout/topic-article/slider/component'
import Hierarchy from 'lib/site/topic-layout/topic-article/hierarchy/component'

const range = {
  '-100': t('proposal-result.very-against'),
  '-75': t('proposal-result.middle-high-against'),
  '-50': t('proposal-result.middle-against'),
  '-25': t('proposal-result.little-against'),
  '0': t('proposal-result.neutral'),
  '25': t('proposal-result.little-support'),
  '50': t('proposal-result.middle-support'),
  '75': t('proposal-result.middle-high-support'),
  '100': t('proposal-result.very-support')
}

const rangeArray = [
  [
    t('proposal-result.very-against'),
    t('proposal-result.middle-high-against'),
    t('proposal-result.middle-against'),
    t('proposal-result.little-against'),
  ],
  [
    t('proposal-result.little-support'),
    t('proposal-result.middle-support'),
    t('proposal-result.middle-high-support'),
    t('proposal-result.very-support')
  ]
]

export default ({ topic }) => (
  <div className='topic-article-content topic-article-action'>
    <h3 className='topic-action-title'>{'¿Star-Lord fue culpable de que Thanos alcanzara su objetivo?'}</h3>
    {!!topic.voted &&
      <div className='topic-action-voted'>
        {topic.open &&
          <p>Ya votaste en la consulta</p>
        }
        <div>
          <span>Elegiste la opción:</span>
          <span className='option'>{topic.action.method !== 'slider' ? topic.voted : range[topic.voted]}</span>
        </div>
      </div>
    }
    {!topic.voted && topic.action.method === 'slider' && topic.open &&
      <p className='slider-description'>Deslizá hacia el lado que se incline más a tu opinión</p>
    }
    {!topic.voted && topic.open && topic.action.method === 'slider' &&
      <div className='slider-options-wrapper'>
        <span>En contra</span>
        <span>A favor</span>
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
    {!topic.voted && topic.action.method === 'slider' && topic.open &&
      <div className='slider-options-container'>
      {rangeArray.map((r, i) => (
        <div className='slider-options-div' key={i}>
          {r.map((option, i) => (
            <span key={i}>{option}</span>
          ))}
        </div>
      ))}
      </div>
    }
    {topic.closed &&
      <div className='action-count'>
        <div className='participantes' />
        <span className='number'>{topic.action.count}</span>
        <span>participantes</span>
      </div>
    }
  </div>
)
