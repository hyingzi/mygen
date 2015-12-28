'use strict';

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let isHelp = process.argv.length === 2;

_commander2.default.usage('<command>').version(require('../package.json').version);

for (let key in _actions2.default) {
  let action = _actions2.default[key];

  if (key === 'init') {
    continue;
  }

  if (action.options) {
    _commander2.default.command(key, action.description, action.options).action(function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (0, _co2.default)(function* () {
        yield _actions2.default.init.apply(action);
        yield action.callback.apply(action, args);
      }).catch(onerror);
    });
  } else {
    _commander2.default.command(key).description(action.description).action(function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      (0, _co2.default)(function* () {
        yield _actions2.default.init.apply(action);
        yield action.callback.apply(action, args);
      }).catch(onerror);
    });
  }
}

_commander2.default[!isHelp ? 'parse' : 'help'](!isHelp ? process.argv : '');

function onerror(err) {
  console.log(err);
}