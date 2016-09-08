const express = require('express');
const fetch = require('node-fetch');
const async = require('asyncawait/async');
const wait = require('asyncawait/await');

const router = express.Router();

router.get('/:gitUserName/:gitRepository', async.cps((req, res) => {
  const gitUserName = req.params.gitUserName;
  const gitRepository = req.params.gitRepository;
  const githubFetch = wait(fetch(`https://api.github.com/repos/${gitUserName}/${gitRepository}`));
  const githubFetchInfo = wait(githubFetch.json());
  res.json(githubFetchInfo);
}));

module.exports = router;
