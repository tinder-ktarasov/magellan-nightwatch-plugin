module.exports = {

  tags: ["search", "web"],

  "Test step one": function (client) {
    client
      .url("http://google.com");
  },

  "Test step arrow": client => {
    client
      .assert.elContainsText("body", "Google")
  },

  "Test step arrow 2": (client) => {
    client
      .assert.elContainsText("body", "Google")
  },

  Test_step_no_quotes: function (client) {
    client
      .assert.elContainsText("body", "Google")
  },

  Test_step_method(client) {
    client
      .assert.elContainsText("body", "Google")
  }


};
