const fetch = require('node-fetch');

module.exports = {
  * list(req) {
    const gitUserName = req.params.gitUserName;
    const gitRepository = req.params.gitRepository;
    const githubFetch = yield fetch(`https://api.github.com/repos/${gitUserName}/${gitRepository}`);
    const githubFetchInfo = yield githubFetch.json();
    const githubFetchInfoFreeze = Object.freeze(githubFetchInfo);
    return githubFetchInfoFreeze;
  }
};
