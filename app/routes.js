module.exports = {
  'GET /images' : 'images.list',
  'GET /images/:imageId' : 'images.getOne',
  'POST /images' : 'images.create',
  'PUT /images/:imageId' : 'images.update',
  'DELETE /images/:imageId' : 'images.delete',
  'GET /git/:gitUserName/:gitRepository' : 'git.list',
};
