'use strict';

let chalk = require('chalk'),
    defaults = require('defaults'),
    path = require('path'),
    strftime = require('strftime'),
    through = require('through2').obj,
    util = require('util');

module.exports = function(opts) {

  opts = defaults(opts, {
    'log': true,
    'count': true,
    'timestamp': '[' + chalk.gray('%H:%M:%S') + ']',
    'prefix': false,
    'postfix': false,
    'format': 'Processing file ' + chalk.magenta('%s'),
    'many-format': 'Processed %d files',
    'one-format': 'Processed 1 file',
    'zero-format': 'No files processed',
  });

  let files = 0;

  let log = function(message) {
    let items = [ message ];
    opts['postfix'] && items.push(opts['postfix']);
    opts['prefix'] && items.unshift(opts['prefix']);
    opts['timestamp'] && items.unshift(strftime(opts['timestamp']));
    console.log.apply(console, items);
  };

  let logChunk = function(chunk, encoding, callback) {
    files++;
    if (opts['log'] && opts['format']) {
      log(util.format(opts['format'], path.relative('', chunk.path)));
    }

    this.push(chunk);
    return callback();
  };

  let logFlush = function(callback) {
    let key = ['zero-format', 'one-format'][files] || 'many-format';
    if (opts['log'] && opts['count'] && opts[key]) {
      log((files > 1) ? util.format(opts[key], files) : opts[key]);
    }

    return callback();
  };

  return through(logChunk, logFlush);
};
