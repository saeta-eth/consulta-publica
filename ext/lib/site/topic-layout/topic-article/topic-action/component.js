import React from 'react'
import Vote from 'lib/site/topic-layout/topic-article/vote/component'
import Poll from 'lib/site/topic-layout/topic-article/poll/component'
import Cause from 'lib/site/topic-layout/topic-article/cause/component'
import Slider from 'lib/site/topic-layout/topic-article/slider/component'
import Hierarchy from 'lib/site/topic-layout/topic-article/hierarchy/component'

export default ({ topic }) => (
  <div className='topic-article-content topic-article-action'>
    <h3 className='topic-action-title'>{'¿Qué propuestas tienen para mejorar los contenidos e información en el sitio web sobre la cuestión de Archivos y Derechos Humanos?'}</h3>
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
  </div>
)