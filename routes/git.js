const express = require('express');
const fetch = require('node-fetch');
const co = require('co');

const router = express.Router();

router.get('/:gitUserName/:gitRepository', co.wrap(function*(req, res, next) {
  const gitUserName = req.params.gitUserName;
  const gitRepository = req.params.gitRepository;
  const githubFetch = yield fetch(`https://api.github.com/repos/${gitUserName}/${gitRepository}`);
  const githubFetchInfo = yield githubFetch.json();
  res.json(githubFetchInfo);
}));

module.exports = router;
