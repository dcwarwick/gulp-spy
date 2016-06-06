'use strict';

let chalk = require('chalk'),
  gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  util = require('gulp-util'),
  merge = require('merge-stream'),
  run = require('run-sequence'),
  spy = require('./');

/* ----- demo tasks -------------------------------------------------------- */

gulp.task('demo-defaults', () =>
  gulp.src('*')
    .pipe(spy()));

gulp.task('demo', (cb) =>
  run('demo-defaults', cb));

/* ---- test tasks --------------------------------------------------------- */

let never = chalk.red.bold('This shouldn\'t appear!');

gulp.task('test-defaults', () =>
  // check the default options
  merge(
    gulp.src('*')
      .pipe(spy({
        'prefix': 'all files:'
      })),
    gulp.src('*.json')
      .pipe(spy({
        'prefix': 'one file:'
      })),
    gulp.src('*.never')
      .pipe(spy({
        'prefix': 'no files:'
      }))
  ));

gulp.task('test-formats', () =>
  // check we can override all the formats
  merge(
    gulp.src('*')
      .pipe(spy({
        'prefix': 'all files:',
        'format': 'I spy \'' + chalk.yellow('%s') + '\' with my little eye',
        'many-format': 'I spied %s files in all',
        'one-format': never,
        'zero-format': never
      })),
    gulp.src('*.json')
      .pipe(spy({
        'prefix': 'one file:',
        'format': 'Is this a %s I see before me?',
        'many-format': never,
        'one-format': 'It sure looked like one',
        'zero-format': never
      })),
    gulp.src('*.md')
      .pipe(spy({
        'prefix': 'another file:',
        'format': 'Hello',
        'many-format': never,
        'one-format': 'Hello yourself, big boy',
        'zero-format': never
      })),
    gulp.src('*.never')
      .pipe(spy({
        'prefix': 'Space:',
        'format': never,
        'many-format': never,
        'one-format': never,
        'zero-format': 'the final frontier'
      }))
  ));

gulp.task('test-nulls', () =>
  // check that we can suppress logging
  merge(
    gulp.src('**/*')
      .pipe(spy({
        'prefix': 'test-nulls-A',
        'log': false,
        'format': never,
        'many-format': never,
        'one-format': never,
        'zero-format': never
      })),
    gulp.src('**/*')
      .pipe(spy({
        'prefix': 'test-nulls-B',
        'count': false,
        'format': false,
        'many-format': never,
        'one-format': never,
        'zero-format': never
      })),
    gulp.src('**/*')
      .pipe(spy({
        'prefix': 'test-nulls-C',
        'format': false,
        'many-format': false,
        'one-format': never,
        'zero-format': never
      })),
    gulp.src('*.json')
      .pipe(spy({
        'prefix': 'test-nulls-D',
        'format': false,
        'many-format': never,
        'one-format': false,
        'zero-format': never
      })),
    gulp.src('*.never')
      .pipe(spy({
        'prefix': 'test-nulls-E',
        'format': never,
        'many-format': never,
        'one-format': never,
        'zero-format': false
      }))
  ));

gulp.task('test-prefixes', () =>
  // check the timestamp, prefix and postfix options
  merge(
    gulp.src('*')
      .pipe(spy({
        'prefix': 'PREFIX>'
      })),
    gulp.src('*')
      .pipe(spy({
        'prefix': 'Look, no time!',
        'timestamp': false
      })),
    gulp.src('*')
      .pipe(spy({
        'prefix': 'Let\'s hear it for the...',
        'postfix': '...postfix'
      }))
  ));

gulp.task('test-preserve', () =>
  // check that we don't disturb the stream contents
  gulp.src('*')
    .pipe(spy({
      'prefix': 'first pass:'
    }))
    .pipe(spy({
      'prefix': 'second pass:'
    })));

gulp.task('test-lint', () =>
  gulp.src('*.js')
    .pipe(eslint())
    .pipe(eslint.format()));

gulp.task('test', (cb) =>
  run('test-defaults', 'test-formats', 'test-nulls', 'test-prefixes', 'test-preserve', 'test-lint', cb));

/* ---- default task ------------------------------------------------------- */

gulp.task('default', ['test']);
