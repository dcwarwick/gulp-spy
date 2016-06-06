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
    'zero-format': 'No files processed'
  });

  let files = 0;

  let log = function(message) {
    let items = [ message ];
    if (opts.postfix) {
      items.push(opts.postfix);
    }
    if (opts.prefix) {
      items.unshift(opts.prefix);
    }
    if (opts.timestamp) {
      items.unshift(strftime(opts.timestamp));
    }
    console.log.apply(console, items);
  };

  let logChunk = function(chunk, encoding, callback) {
    files++;
    if (opts.log && opts.format) {
      log(util.format(opts.format, path.relative('', chunk.path)));
    }
    this.push(chunk);  // eslint-disable-line no-invalid-this
    return callback();
  };

  let logFlush = function(callback) {
    let format = ['zero-format', 'one-format'][files] || 'many-format';
    if (opts.log && opts.count && opts[format]) {
      log((files > 1) ? util.format(opts[format], files) : opts[format]);
    }
    return callback();
  };

  return through(logChunk, logFlush);
};
