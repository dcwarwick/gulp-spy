'use strict';

let chalk = require('chalk'),
  defaults = require('defaults'),
  path = require('path'),
  strftime = require('strftime'),
  through = require('through2').obj,
  util = require('util');

module.exports = function(opts) {
  opts = defaults(opts, {
    'prefix': false,
    'postfix': false,
    'count': true,
    'log': true,
    'console': console,
    'format': 'Processing file ' + chalk.magenta('%s'),
    'timestamp': '[' + chalk.gray('%H:%M:%S') + ']',
    'many-format': 'Processed %d files',
    'one-format': 'Processed 1 file',
    'zero-format': 'No files processed',
    'date': false
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
      items.unshift(strftime(opts.timestamp, opts.date));
    }
    opts.console.log.apply(console, items);
  };

  let onChunk = function(chunk, encoding, callback) {
    files++;
    if (opts.log && opts.format) {
      log(util.format(opts.format, path.relative('', chunk.path)));
    }
    this.push(chunk);  // eslint-disable-line no-invalid-this
    return callback();
  };

  let onFlush = function(callback) {
    let format = ['zero-format', 'one-format'][files] || 'many-format';
    if (opts.log && opts.count && opts[format]) {
      log((files > 1) ? util.format(opts[format], files) : opts[format]);
    }
    return callback();
  };

  return through(onChunk, onFlush);
};
