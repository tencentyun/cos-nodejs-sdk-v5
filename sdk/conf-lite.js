/**
 * Conf 的轻量平替（零依赖）
 *
 * 仅实现 session.js 用到的最小子集：构造、get、set、delete。
 * 行为对齐 conf@9.0.2：
 *   - 文件路径：path.resolve(opts.cwd || envPathsConfig(opts.projectName), `${opts.configName || 'config'}.json`)
 *   - 每次 get/set/delete 都重新读盘（与 conf 一致，无内存缓存）
 *   - 写盘走「写临时文件 + rename」的原子写，rename 失败（EXDEV）回退普通写
 *   - 文件不存在 → 返回空对象；目录不存在 → 自动 mkdir -p
 *   - JSON 损坏会抛错，由调用方 try/catch 兜底（与 conf 一致）
 *
 * 不实现：schema/ajv、加密、watch、migrations、events、dot-notation、defaults。
 * SDK 的 session.js 没用到这些功能。
 */
var fs = require('fs');
var path = require('path');
var os = require('os');
var crypto = require('crypto');

// 等价于 env-paths(name, { suffix: 'nodejs' }).config —— 仅在调用方没传 cwd 时使用
function envPathsConfig(projectName) {
  var name = projectName + '-nodejs';
  var homedir = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(homedir, 'Library', 'Preferences', name);
  }
  if (process.platform === 'win32') {
    var appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
    return path.join(appData, name, 'Config');
  }
  // linux / others
  return path.join(process.env.XDG_CONFIG_HOME || path.join(homedir, '.config'), name);
}

// 原子写：写到同目录的随机临时文件，再 rename 覆盖目标
// 同目录 rename 在主流文件系统都是原子操作，避免半截写造成的损坏
function atomicWriteFileSync(filePath, data) {
  var dir = path.dirname(filePath);
  var tmpPath = path.join(dir, '.' + path.basename(filePath) + '.' + crypto.randomBytes(6).toString('hex') + '.tmp');
  try {
    fs.writeFileSync(tmpPath, data);
    try {
      fs.renameSync(tmpPath, filePath);
    } catch (err) {
      // 跨设备 rename 失败时回退到非原子写（conf 也是这么处理 EXDEV）
      if (err && err.code === 'EXDEV') {
        fs.writeFileSync(filePath, data);
        try { fs.unlinkSync(tmpPath); } catch (e) {}
      } else {
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        throw err;
      }
    }
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch (e) {}
    throw err;
  }
}

// 递归创建目录（兼容 Node 6+，不依赖 mkdirSync 的 recursive 选项）
// 实现策略：先尝试创建目标目录，失败时按错误码分类处理：
//   - EEXIST：目录已存在 → 视为成功
//   - ENOENT：父目录不存在 → 递归创建父目录后重试
//   - 其他：抛出
function mkdirpSync(dir) {
  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (!err) return;
    if (err.code === 'EEXIST') return;
    if (err.code === 'ENOENT') {
      var parent = path.dirname(dir);
      if (parent && parent !== dir) {
        mkdirpSync(parent);
        try {
          fs.mkdirSync(dir);
        } catch (e) {
          if (!e || e.code !== 'EEXIST') throw e;
        }
        return;
      }
    }
    throw err;
  }
}

function ConfLite(opts) {
  opts = opts || {};
  var configName = opts.configName || 'config';
  var cwd = opts.cwd;
  if (!cwd) {
    var projectName = opts.projectName;
    if (!projectName) {
      throw new Error('Project name could not be inferred. Please specify the `projectName` option.');
    }
    cwd = envPathsConfig(projectName);
  }
  this.path = path.resolve(cwd, configName + '.json');
}

ConfLite.prototype._read = function () {
  try {
    var raw = fs.readFileSync(this.path, 'utf8');
    var data = JSON.parse(raw);
    // 跟 conf 一致：返回纯对象（无原型链污染风险）
    return Object.assign(Object.create(null), data);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      // 文件不存在 → 顺手建目录，返回空对象
      mkdirpSync(path.dirname(this.path));
      return Object.create(null);
    }
    // JSON 损坏等其他错误抛给调用方（session.js 外层有 try/catch）
    throw err;
  }
};

ConfLite.prototype._write = function (store) {
  mkdirpSync(path.dirname(this.path));
  atomicWriteFileSync(this.path, JSON.stringify(store, null, '\t'));
};

ConfLite.prototype.get = function (key, defaultValue) {
  var store = this._read();
  return key in store ? store[key] : defaultValue;
};

ConfLite.prototype.set = function (key, value) {
  if (typeof key !== 'string') {
    throw new TypeError('Expected `key` to be of type `string`, got ' + typeof key);
  }
  if (value === undefined) {
    throw new TypeError('Use `delete()` to clear values');
  }
  var store = this._read();
  store[key] = value;
  this._write(store);
};

ConfLite.prototype.delete = function (key) {
  var store = this._read();
  delete store[key];
  this._write(store);
};

ConfLite.prototype.has = function (key) {
  var store = this._read();
  return key in store;
};

ConfLite.prototype.clear = function () {
  this._write(Object.create(null));
};

module.exports = ConfLite;
