var express = require('express')
var models = require('lib/models')
var hasAccess = require('lib/is-owner').hasAccess
var config = require('lib/config')

var log = require('debug')('democracyos:comment-csv')

var Comment = models.Comment

var mongoose = require('mongoose')
var Topic = mongoose.model('Topic')

var app = module.exports = express()

var titles = [
  'Topic ID',
  'Topic Title',
  'Topic URL',
  'Comment ID',
  'Comment Location',
  'Comment Cateogry',
  'Comment Topic Paragraph',
  'Comment Text',
  'Comment Author Fullname',
  'Comment Author Email',
  'Reply Text',
  'Reply Author Fullname',
  'Reply Author Email'
].join(',') + '\r'

app.get('/comment/all.csv', hasAccess, findAllComments, findAllParagraphs, function (req, res) {
  if (!req.comments) return res.status(400).end()

  res.status(200)
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename=comments.csv'
  })

  var csvArray = req.comments.map(function (comment) {
    var replies = (comment.replies.length > 0) ? comment.replies : [{text: '', author: {fullName: '', email: ''}}]
    return replies.map(function (reply, i) {
      return [
        comment.topicId.id,
        comment.topicId.mediaTitle,
        `${config.protocol}://${config.host}/consulta/${comment.topicId.id}`,

        '"' + comment.id + '"',
        '"' + comment.context + '"',
        '"' + comment.category + '"',
        (comment.context === 'paragraph')
          ? (req.paragraphs[comment.reference])
            ? '"' + escapeTxt(req.paragraphs[comment.reference]) + '"'
            : '' : '',
        '"' + escapeTxt(comment.text) + '"',
        '"' + comment.author.fullName + '"',
        '"' + comment.author.email + '"',

        '"' + escapeTxt(reply.text) + '"',
        '"' + reply.author.fullName + '"',
        '"' + reply.author.email + '"'

      ].join(',')
    }).join('\n')
  }).join('\n')

  res.write(titles + csvArray)

  res.end()
})

function findAllComments (req, res, next) {
  Comment
    .find({})
    .sort('-createdAt')
    .populate('author')
    .populate('replies.author')
    .populate({path: 'topicId', model: 'Topic'})
    .exec(function (err, comments) {
      if (err) {
        log(err)
        res.status(500).end()
        return
      }

      req.comments = comments
      next()
    })
}

function findAllParagraphs (req, res, next) {
  var pIds = req.comments
    .filter(function (comment) { return comment.context === 'paragraph' })
    .map(function (comment) { return comment.topicId })

  Topic.find({'_id': {$in: pIds}})
    .exec(function (err, topics) {
      if (err) {
        log(err)
        res.status(500).end()
        return
      }
      var pObj = {}
      topics
        .map(function (topic) { return topic.clauses })
        .reduce(function (a, b) { return a.concat(b) }, [])
        .forEach(function (p) { pObj[p._id] = p.markup })
      req.paragraphs = pObj
      next()
    })
}

function escapeTxt (text) {
  return text.replace(/"/g, "'").replace(/\r/g, '').replace(/\n/g, '')
}
