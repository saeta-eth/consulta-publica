module.exports = function factory(multiForum,subPath) {
  return {
    forum: function (forum) {
      if (forum) return subPath + '/' + forum.name;
      else return subPath + '';
    },

    topic: function (topic, forum) {
      if (!topic) throw new Error('Topic is required.');
      var url = multiForum ? this.forum(forum) : '';
      url += '/consulta/' + topic.id;
      return url;
    },

    admin: function (forum) {
      if (forum) return subPath + '/' + forum.name + '/admin';
      else return subPath + '/admin';
    }
  };
};
