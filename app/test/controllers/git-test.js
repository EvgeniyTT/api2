const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const gitModule = require('../../src/controllers/git');
const co = require('co');

describe('gitModule', function() {
  it('positive test: provide user and repository name and expect respons contains the right url', co.wrap(function*() {
    const request = {};
    request.params = {};
    request.params.gitUserName = 'EvgeniyTT';
    request.params.gitRepository = 'api2';
    const result = yield gitModule.list(request);
    expect(result.url).to.equal('https://api.github.com/repos/EvgeniyTT/api2');
  }));
  it('positive test: is test response frozen', co.wrap(function*() {
    const request = {};
    request.params = {};
    request.params.gitUserName = 'EvgeniyTT';
    request.params.gitRepository = 'api2';
    const result = yield gitModule.list(request);
    expect(result).to.be.frozen;
  }));
  it('negative test: list* function throw error if request is not provided', co.wrap(function*() {
    try {
      yield gitModule.list();
    } catch (e) {
      expect(e).to.be.an('error');
    }
  }));
  it('negative test: list* function throw error if string/number/empty object/undefined/null is provided as a request', co.wrap(function*() {
    try {
      yield gitModule.list('string');
    } catch (e) {
      expect(e).to.be.an('error');
    }
    try {
      yield gitModule.list(5);
    } catch (e) {
      expect(e).to.be.an('error');
    }
    try {
      let undefinedVariable
      yield gitModule.list(undefinedVariable);
    } catch (e) {
      expect(e).to.be.an('error');
    }
    try {
      yield gitModule.list(null);
    } catch (e) {
      expect(e).to.be.an('error');
    }
  }));
});
