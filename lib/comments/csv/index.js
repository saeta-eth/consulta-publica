var express = require('express');
var models = require('lib/models');
var hasAccess = require('lib/is-owner').hasAccess;

var log = require('debug')('democracyos:comment-csv');

var Comment = models.Comment;

var app = module.exports = express();

var titles = [
  'Topic ID',
  'Topic Title',
  'Topic URL',
  'Comment ID',
  'Comment Type',
  'Comment Topic Paragraph',
  'Comment Text',
  'Comment Author Fullname',
  'Comment Author Email',
  'Reply Text',
  'Reply Author Fullname',
  'Reply Author Email'
].join(',') + '\n';

app.get('/comment/all.csv', hasAccess, findAllComments, function (req, res) {
  if (!req.comments) return res.status(400).end();

  res.writeHead(200, {
    'Content-Type': 'text/plain'
    // 'Content-Type': 'text/csv',
    // 'Content-Disposition': 'attachment; filename=comments.csv'
  });

  res.write(titles);

  req.comments.forEach(function (comment) {
    var values = [
      comment.topicId.id,
      comment.topicId.mediaTitle,
      '/topic/' + comment.topicId.id,

      comment.id,
      comment.context,
      '',
      comment.text,
      comment.author.fullName,
      comment.author.email
    ];

    res.write(values.join(',').toString() + '\n');
  });

  res.end();
});

function findAllComments (req, res, next) {
  Comment
    .find({})
    .sort('-createdAt')
    .populate('author')
    .populate('replies.author')
    .populate({path: 'topicId', model: 'Topic'})
    .exec(function (err, comments) {
      if (err) {
        log(err);
        res.status(500).end();
        return;
      }

      req.comments = comments;
      next();
    });
}
