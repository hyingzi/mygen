'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helper = require('./helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let fileName, foldersName;

fileName = '.genrc';
foldersName = 'generator';

exports.default = {
  *init() {
    yield _helper2.default.mkdir(foldersName);
    yield _helper2.default.writeFile(fileName, {
      github: null,
      staticFile: 'http://www.staticfile.org'
    });
  },
  'clear': {
    description: 'Clear generator',
    *callback() {
      yield _helper2.default.rmdir(foldersName);
    }
  },
  'install': {
    description: 'Install generator',
    *callback() {
      let obj, url, zipName;

      obj = unserialize((yield _helper2.default.readFile(fileName)));
      url = `https://github.com/${ obj.github }/generator/archive/master.zip`;

      yield _helper2.default.unzip(zipName = yield _helper2.default.download(url), 'temp');
      yield _helper2.default.move('temp/generator-master', foldersName);
      yield _helper2.default.unlink(zipName);
      yield _helper2.default.rmdir('temp');
    }
  },
  'get': {
    description: 'Get the config value',
    *callback(key) {
      if (isString(key)) {
        let obj = unserialize((yield _helper2.default.readFile(fileName)));
        console.log(`${ obj[key] }\n`);
      }
    }
  },
  'set': {
    description: 'Set the config value',
    *callback(key, value) {
      if (isString(key) && isString(value)) {
        let obj = unserialize((yield _helper2.default.readFile(fileName)));

        yield _helper2.default.writeFile(fileName, Object.assign(obj, {
          [key]: value
        }), true);
      }
    }
  },
  'config': {
    description: 'Output the config value',
    *callback() {
      let obj, result;

      result = [];
      obj = unserialize((yield _helper2.default.readFile(fileName)));

      for (let key in obj) {
        result.push(`${ key } = ${ obj[key] }\n`);
      }

      console.log(result.join(''));
    }
  },
  'list': {
    description: 'Output the generator available',
    *callback() {
      let result = [];

      for (let item of yield _helper2.default.readdir(foldersName)) {
        result.push(`${ item }\n`);
      }

      console.log(result.join(''));
    }
  },
  '*': {
    options: {
      noHelp: true
    },
    description: 'Generator App',
    *callback(cmd) {
      yield _helper2.default.copy(`${ foldersName }/${ cmd }`, process.cwd());
      console.log('Bingo!\n');
    }
  }
};

function isString(obj) {
  return typeof obj === 'string';
}

function unserialize(str) {
  return JSON.parse(str);
}