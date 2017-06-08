module.exports = {
  tags: ["wiki"],

  beforeEach: function () {},
  afterEach: function () {},

  "Test step one": function (client) {
    client
      .url("http://en.wikipedia.org");
  },

  "Test step two": function (client) {
    client
      .assert.elContainsText("body", "Wikipedia")
  }


};
