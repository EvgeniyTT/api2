const express = require('express');
const fetch = require('node-fetch');
const async = require('asyncawait/async');
const wait = require('asyncawait/await');

const router = express.Router();


router.get('/:gitUserName/:gitRepository', async((req, res, next) => {
  const gitUserName = req.params.gitUserName;
  const gitRepository = req.params.gitRepository;
  try {
    const githubFetch = wait(fetch(`https://api.github.com/repos/${gitUserName}/${gitRepository}`));
    const githubFetchInfo = wait(githubFetch.json());
    res.json(githubFetchInfo);
  } catch (error) {
    res.send(error);
  }
}));

module.exports = router;
