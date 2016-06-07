'use strict';

let chalk = require('chalk'),
  crypto = require('crypto'),
  gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  stream = require('stream'),
  should = require('should'),
  spy = require('../');

let never = chalk.red.bold('This shouldn\'t appear!');
let adate = new Date(1297949695456);

// this helper tests that logged output matches a checksum
let cksmIt = function(spec, glob, checksum, opts1, opts2) {
  it(spec, function(done) {
    let hash = crypto.createHash('SHA1'),
      hasher = new stream.Writable({
        write: (chunk, encoding, callback) => {
          process.stdout.write(chalk.yellow('>>> ') + chunk.toString());
          hash.update(chunk.toString());
          callback();
        }
      });

    opts1 = opts1 || {};
    opts2 = opts2 || { log: false };
    opts1.console = opts2.console = new console.Console(hasher);
    opts1.date = opts2.date = adate;

    gulp.src(glob)
      .pipe(spy(opts1))
      .pipe(spy(opts2))
      .on('finish', function() {
        hash.digest('hex').should.be.equal(checksum);
        done();
      });
  });
};

// this helper tests that logged output matches a string
let mtchIt = function(spec, glob, match, opts) {
  it(spec, function(done) {
    let matcher = new stream.Writable({
      write: (chunk, encoding, callback) => {
        chunk.toString().should.be.equal(match);
        callback();
      }
    });

    opts = opts || {};
    opts.console = new console.Console(matcher);
    opts.date = adate;

    gulp.src(glob)
      .pipe(spy(opts))
      .on('finish', done);
  });
};

// this helper tests that no logging is done at all
let nillIt = function(spec, glob, opts) {
  it(spec, function(done) {
    let thrower = new stream.Writable({
      write: (chunk, encoding, callback) => {
        throw new Error('should not produce output');
      }
    });

    opts = opts || {};
    opts.console = new console.Console(thrower);
    opts.date = adate;

    gulp.src(glob)
      .pipe(spy(opts))
      .on('finish', done);
  });
};

describe('gulp-spy', function() {

  cksmIt('should spy on empty stream', 'test/fixtures/*.zero',
         'be0778d4d3c0d0084307e0bce02a2e02d8539441');

  cksmIt('should spy on a single file', 'test/fixtures/*.one',
         'a9941bac9bc4d6d6453bf6335244efbb5ca7aab8');

  cksmIt('should spy on multiple files', 'test/fixtures/*.many',
         '07c3493f8636fb74cf2ebad306d24fe71ac85aa7');

  cksmIt('should display custom prefix on files and summary', 'test/fixtures/*.one',
         'c0f989c784782ee0bd10f920d925bb978fcb5463', {
           prefix: 'PREFIX>'
         });

  cksmIt('should display custom postfix on files and summary', 'test/fixtures/*.one',
         '01a74d95c54c7644f6982393189e8b181df62655', {
           postfix: '<POSTFIX'
         });

  nillIt('should not log when log mode is off', 'test/fixtures/*.many', {
    log: false,
    format: never,
    'many-format': never,
    'one-format': never,
    'zero-format': never
  });

  mtchIt('should not log files when format is falsy', 'test/fixtures/*.many',
         'Processed 5 files\n', {
           format: false,
           timestamp: false
         });

  nillIt('should not log summary when count mode is off', 'test/fixtures/*.many', {
    format: false,
    count: false
  });

  nillIt('should not log zero file summary when zero-format is falsy', 'test/fixtures/*.zero', {
    format: false,
    'many-format': never,
    'one-format': never,
    'zero-format': false
  });

  nillIt('should not log one file summary when one-format is falsy', 'test/fixtures/*.one', {
    format: false,
    'many-format': never,
    'one-format': false,
    'zero-format': never
  });

  nillIt('should not log multiple file summary when many-format is falsy', 'test/fixtures/*.many', {
    format: false,
    'many-format': false,
    'one-format': never,
    'zero-format': never
  });

  cksmIt('should display custom timestamp on files and summary', 'test/fixtures/*.one',
         '47147e54dd8e00e911e5fe106ae19d64f3bf7cac', {
           timestamp: 'Hey, it\'s %B %d, %Y %H:%M:%S:'
         });

  cksmIt('should not display falsy timestamp on files or summary', 'test/fixtures/*.one',
         '97113ec8ba129acc15860502236fb8f4d4cf8014', {
           timestamp: false
         });

  cksmIt('should display custom formats on empty stream', 'test/fixtures/*.zero',
         '8583b9c55986a661b8ad70e78cf5e3afd0eab05a', {
           prefix: 'Space:',
           format: never,
           'many-format': never,
           'one-format': never,
           'zero-format': 'the final frontier'
         });

  cksmIt('should display custom formats on a single file', 'test/fixtures/*.one',
         '45f5e0396b496a9fe66ac2a47569cb1ab8a4f2d5', {
           format: 'Is this a %s I see before me?',
           'many-format': never,
           'one-format': 'It sure looked like one',
           'zero-format': never
         });

  cksmIt('should display custom formats on multiple files', 'test/fixtures/*.many',
         'b762ea3522721848e3fd688f46bc874e16b9df64', {
           format: 'I spy \'' + chalk.yellow('%s') + '\' with my little eye',
           'many-format': 'I spied %s files in all',
           'one-format': never,
           'zero-format': never
         });

  cksmIt('should append file names and counts to custom formats with no token', 'test/fixtures/*.many',
         'd14ffa41feeb56f378d9c17c75de9bd8521a1463', {
           format: 'Hello',
           'many-format': 'Goodbye',
           'one-format': never,
           'zero-format': never
         });

  cksmIt('should not disturb the stream contents', 'test/fixtures/*.many',
         'a9fb9cbf430e7130793e2f7a112899e8225b28c3', {}, {});

  it('should not contain linter errors', (done) =>
    gulp.src(['*.js', 'test/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .on('finish', done));
});
