var Locator = function (filename, testcase) {
  this.filename = filename;
  this.testcase = testcase;
};

Locator.prototype.toString = function () {
  return this.filename + ':' + this.testcase;
};

module.exports = Locator;
