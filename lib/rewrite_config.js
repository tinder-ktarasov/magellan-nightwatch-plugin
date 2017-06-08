var fs = require("fs");
var path = require("path");
var util = require("util");
var _ = require("lodash");
var logger = require("./logger");

var SELEMIUM_VER_STR_TMPLT = "./node_modules/selenium-server/lib/runner/selenium-server-standalone-%s.jar"
var CHROMEDRIVER_LOCATION = "./node_modules/chromedriver/lib/chromedriver/chromedriver";
var PHANTOMJS_LOCATION = "./node_modules/phantomjs/bin/phantomjs";
// throws file read/write exceptions, JSON parse exceptions
module.exports = function (sourceConfigPath, tempAssetPath, options) {
  /* eslint-disable import/no-dynamic-require */
  var fullConfigPath = path.resolve(sourceConfigPath);
  var isJs = fullConfigPath.toLowerCase().endsWith('.js');

  var conf;
  var confSet;
  var confOutput;
  if (isJs) {
    conf = require(fullConfigPath);
    confOutput = fs.readFileSync(fullConfigPath, "utf8");
    confSet = (key, value) => {
      let serialized;
      if (typeof value === 'object') {
        serialized = JSON.stringify(value);
      } else {
        serialized = value;
      }
      confOutput = `${confOutput}\nmodule.exports.${key} = ${serialized};`;
    };
  } else {
    conf = JSON.parse(fs.readFileSync(fullConfigPath, "utf8"));
    confSet = (key, value) => {
      const parts = Array.isArray(key) ? key : key.split('.');
      const lastPart = parts.pop();
      let root = conf;
      parts.forEach(part => {
        root = root[part];
      });
      root[lastPart] = value;
    };
  }

  if (options.syncBrowsers) {
    if (!conf.test_settings.default.globals) {
      confSet('test_settings.default.globals', {});
    }
    confSet('test_settings.default.globals.syncModeBrowserList', options.syncBrowsers.split(","));
  }

  if (options.localSeleniumPort) {
    // Local-testing selenium port (non-sauce)
    // Tell nightwatch to both start and connect to a selenium server on port {seleniumPort}
    confSet('selenium.port', options.localSeleniumPort);
    confSet('test_settings.default.selenium_port', options.localSeleniumPort);

    if (options.localSeleniumVersion) {
      conf.selenium.server_path = util.format(SELEMIUM_VER_STR_TMPLT, options.localSeleniumVersion);
    }
  }

  if (options.isChromedriverPresent) {
    // append chrome driver location if user specifies chromedriver in conf to use
    if (!conf.selenium.cli_args) {
      // create structure if not defined
      confSet('selenium.cli_args', {});
    }

    if (!conf.selenium.cli_args["webdriver.chrome.driver"]) {
      // don't overwrite user value
      confSet(["selenium", "cli_args", "webdriver.chrome.driver"], CHROMEDRIVER_LOCATION);
    }
  }

  if (options.isPhantomjsPresent) {
    // append phantomjs location if user specifies phantomjs in conf to use 
    if (!conf.test_settings.phantomjs) {
      // create structure if not defined
      confSet('test_settings.phantomjs', {
        desiredCapabilities: {
          browserName: "phantomjs"
        }
      });
    }
    if (!conf.test_settings.phantomjs.desiredCapabilities["phantomjs.binary.path"]) {
      // don't overwrite user value
      confSet(["test_settings", "phantomjs", "desiredCapabilities", "phantomjs.binary.path"], PHANTOMJS_LOCATION);
    }
  }

  var testSettings = _.cloneDeep(conf.test_settings[options.executor]);
  conf.test_settings[options.executor] = _.merge(testSettings, options.executorCapabilities);

  // Write all the above details to a temporary config file, then return the temporary filename
  var tempConfigName = isJs ? "nightwatch.js" : "nightwatch.json";
  var tempConfigPath = path.resolve(`${tempAssetPath}/${tempConfigName}`);

  if (isJs) {
    var oldDir = path.dirname(fullConfigPath);
    var newDir = tempAssetPath;
    var oldBasePath = path.relative(newDir, oldDir);
    confOutput = confOutput.replace(
      /^\s*(var|const)\s*__MAGELLAN_PREFIX\s*=.+/,
      `$1 __MAGELLAN_PREFIX = "${oldBasePath}";`
    );
    confOutput = `${confOutput}\n`;
  } else {
    confOutput = JSON.stringify(conf);
  }
  fs.writeFileSync(tempConfigPath, confOutput, "utf8");

  return tempConfigPath;
};
