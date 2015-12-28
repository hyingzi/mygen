'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mv = require('mv');

var _mv2 = _interopRequireDefault(_mv);

var _fs2 = require('fs');

var _fs3 = _interopRequireDefault(_fs2);

var _ncp = require('ncp');

var _ncp2 = _interopRequireDefault(_ncp);

var _coFs = require('co-fs');

var _coFs2 = _interopRequireDefault(_coFs);

var _unzip = require('unzip');

var _unzip2 = _interopRequireDefault(_unzip);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _path = require('path');

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  *writeFile() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    let override = arguments[2];

    if (!(yield _coFs2.default.exists(path)) || override) {
      if (typeof content === 'object') {
        content = JSON.stringify(content);
      }

      yield _coFs2.default.writeFile(path, content, 'utf8');
    }

    return path;
  },
  *readFile() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    if (yield _coFs2.default.exists(path)) {
      content = yield _coFs2.default.readFile(path, 'utf8');
    }

    return content;
  },
  *unlink() {
    for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
      paths[_key] = arguments[_key];
    }

    for (let path of paths) {
      if (yield _coFs2.default.exists(path)) {
        yield _coFs2.default.unlink(path);
      }
    }

    return true;
  },
  *mkdir() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    if (!(yield _coFs2.default.exists(path))) {
      yield _coFs2.default.mkdir(path);
    }

    return path;
  },
  *readdir() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let result = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    if (yield _coFs2.default.exists(path)) {
      for (let item of yield _coFs2.default.readdir(path)) {
        let tmp = (0, _path.join)(path, item);

        if ((yield _coFs2.default.lstat(tmp)).isDirectory() && !tmp.includes('.')) {
          result.push(item);
        }
      }
    }

    return result;
  },
  *rmdir() {
    for (var _len2 = arguments.length, paths = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      paths[_key2] = arguments[_key2];
    }

    for (let path of paths) {
      if (yield _coFs2.default.exists(path)) {
        for (let item of yield _coFs2.default.readdir(path)) {
          let tmp = (0, _path.join)(path, item);

          if ((yield _coFs2.default.lstat(tmp)).isDirectory()) {
            yield this.rmdir(tmp);
          } else {
            yield this.unlink(tmp);
          }
        }

        yield _coFs2.default.rmdir(path);
      }
    }

    return true;
  },
  *download() {
    let url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let showProgress = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    return new Promise(function (resolve, reject) {
      (0, _request2.default)(url).on('response', function (res) {
        let total, progress, path;

        path = (0, _path.parse)(url).base;
        total = parseInt(res.headers['content-length'], 10);

        if (isNaN(total)) {
          reject(new Error('can not find the remote file'));
          return;
        }

        if (showProgress) {
          progress = new _progress2.default('Downloading... [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            total: total
          });
        }

        res.on('data', function (chunk) {
          showProgress && progress.tick(chunk.length);
        }).pipe(_fs3.default.createWriteStream(path));

        res.on('end', function () {
          showProgress && progress.tick(progress.total - progress.curr);
          resolve(path);
        });
      });
    });
  },
  *unzip() {
    let filePath = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let foldersPath = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    return new Promise((resolve, reject) => {
      _fs3.default.createReadStream(filePath).on('end', function () {
        setTimeout(() => {
          resolve(foldersPath);
        }, 100);
      }).pipe(_unzip2.default.Extract({ path: foldersPath }));
    });
  },
  *move() {
    let srcPath = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let distPath = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    return new Promise((resolve, reject) => {
      (0, _mv2.default)(srcPath, distPath, { mkdirp: false }, function (err) {
        if (err) {
          reject(err);
        }

        resolve(true);
      });
    });
  },
  *copy() {
    let srcPath = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    let distPath = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _ncp2.default.ncp.limit = 16;

    return new Promise((resolve, reject) => {
      _ncp2.default.ncp(srcPath, distPath, function (err) {
        if (err) {
          reject(err);
        }

        resolve(true);
      });
    });
  }
};