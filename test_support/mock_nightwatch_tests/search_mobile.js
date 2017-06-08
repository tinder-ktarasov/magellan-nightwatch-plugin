module.exports = {
  tags: ["search", "mobile"],

  before: function () {},
  after: function () {},

  "Test step one": function (client) {
    client
      .url("http://google.com/mobile");
  },

  "Test step two": function (client) {
    client
      .assert.elContainsText("body", "Google")
  }


};
