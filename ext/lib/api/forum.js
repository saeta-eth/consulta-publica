const ObjectId = require('mongoose').Types.ObjectId
const filter = require('mout/object/filter')
const express = require('express')
const debug = require('debug')
const config = require('lib/config')
const api = require('lib/db-api')
const apiV2 = require('lib/api-v2/db-api')
const middlewares = require('lib/api-v2/middlewares')
const { expose } = require('lib/utils')
const { canCreateForum } = require('lib/middlewares/forum-middlewares')

const log = debug('democracyos:ext:api:create-forum')

const app = module.exports = express()

const getUserKeys =  (scope) => {
  scope = scope ? scope + '.' : ''
  return '%id %fullName %displayName %avatar %locale'.replace(/%/g, scope)
}

const keys = [
  'id',
  'name',
  'title',
  'summary',
  'richSummary',
  'visibility',
  'createdAt',
  'coverUrl',
  'topicsAttrs',
  'initialTags',
  'extra',
  getUserKeys('owner')
].join(' ')


app.post('/create',
middlewares.users.restrict,
canCreateForum,
function createForum(req, res, next) {
  const data = {
    name: req.body.name,
    title: req.body.title,
    owner: req.user._id,
    body: req.body.body,
    summary: req.body.summary,
    coverUrl: req.body.cover,
    permissions: req.body.permissions,
    extra: {
      richSummary: req.body.richSummary
    }
  }

  log('Trying to create forum with name: %s', data.name)

  api.forum.create(data, function (err, forum) {
    if(err) next(err)
    log('Forum document created successfully: %s', forum.name)
    return res.json(expose(keys)(forum))
  })
})

app.put('/:id',
middlewares.forums.findById,
function parseUpdateableKeys (req, res, next) {
  const updatableKeys = [
    'name',
    'title',
    'summary',
    'coverUrl',
    'extra'
  ]
  req.keysToUpdate = filter(req.body, (v, k) => updatableKeys.includes(k))
  next()
},
function edit (req, res, next) {
  console.log('req.keysToUpdate', req.keysToUpdate)
  apiV2.forums
    .edit({ _id: req.params.id }, req.keysToUpdate)
    .then((forum) => {
      res.status(200).json({
        status: 200,
        results: {
          forum: forum
        }
      })
    })
    .catch(next)
})
