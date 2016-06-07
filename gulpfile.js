'use strict';

let chalk = require('chalk'),
  gulp = require('gulp'),
  run = require('run-sequence'),
  spy = require('./');

/* ----- demo tasks -------------------------------------------------------- */

gulp.task('demo-defaults', () =>
  gulp.src('*')
    .pipe(spy()));

gulp.task('demo-prefix', () =>
  gulp.src('*.js')
    .pipe(spy({
      prefix: 'my prefix:'
    })));

gulp.task('demo-postfix', () =>
  gulp.src('*.js')
    .pipe(spy({
      postfix: 'with this postfix'
    })));

gulp.task('demo-format', () =>
  gulp.src('*.js')
    .pipe(spy({
      format: '>' + chalk.yellow('%s')
    })));

gulp.task('demo-timestamp1', () =>
  gulp.src('*.js')
    .pipe(spy({
      timestamp: 'Hey, it\'s %B %d, %Y %H:%M:%S:'
    })));

gulp.task('demo-timestamp2', () =>
  gulp.src('*.js')
    .pipe(spy({
      timestamp: false
    })));

gulp.task('demo-many-format', () =>
  gulp.src('*.js')
    .pipe(spy({
      'many-format': 'Total: ' + chalk.cyan('%s files')
    })));

gulp.task('demo-one-format', () =>
  gulp.src('*.md')
    .pipe(spy({
      'one-format': 'Found ' + chalk.cyan('1 file')
    })));

gulp.task('demo-zero-format', () =>
  gulp.src('*.never')
    .pipe(spy({
      'zero-format': 'No files matched'
    })));

gulp.task('demo', (cb) =>
  run('demo-defaults',
      'demo-prefix',
      'demo-postfix',
      'demo-format',
      'demo-timestamp1',
      'demo-timestamp2',
      'demo-many-format',
      'demo-one-format',
      'demo-zero-format', cb));

/* ---- default task ------------------------------------------------------- */

gulp.task('default', ['demo']);
