'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  browserify = require('gulp-browserify'),
  concat = require('gulp-concat'),
  rimraf = require('gulp-rimraf'),
  sass = require('gulp-ruby-sass'),
  rimraf = require('gulp-rimraf'),
  autoprefixer = require('gulp-autoprefixer');

var appServer = require('./api/server');

var server = appServer.server,
  refresh = appServer.refresh,
  livereloadport = appServer.livereloadport,
  serverport = appServer.serverport;

// Clean task
gulp.task('clean', function(cb) {
  rimraf('./dist', cb);
});

gulp.task('html', function() {
  return gulp.src(['app/html/*.html'])
    .pipe(jshint())
    .pipe(gulp.dest('dist/'));
});

// Fonts Task
gulp.task('copy-fonts', function() {
  return gulp.src('app/fonts/*')
    .pipe(gulp.dest('dist/fonts/'));
});

// JSHint task
gulp.task('lint', function() {
  return gulp.src(['app/js/*.js', '!app/js/vendor/*.js', '!app/js/main_old.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// css task
gulp.task('css', function() {

  return gulp.src(['app/css/main.scss', 'app/modules/**/css/**.scss'])
    // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
    .pipe(sass({
      sourcemap: true,
      sourcemapPath: '../scss'
    }))
    // Optionally add autoprefixer
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 9'))
    // These last two should look familiar now :)
    .pipe(concat('main.css'))
    .on('error', function(err) {
      console.log('sass error', err.message);
    })
    .pipe(gulp.dest('dist/css/'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out)
  return gulp.src(['app/js/main.js', '!app/js/main_old.js'])
    .pipe(browserify({
      insertGlobals: true,
      debug: false
    }))
    // Bundle to a single file
    .pipe(concat('bundle.js'))
    // Output it to our dist folder
    .pipe(gulp.dest('dist/js'));
});

// Copy Images
gulp.task('img', function() {
  return gulp.src('app/img/**/*')
    .pipe(gulp.dest('dist/img'));
});

// Copy Vendor JS that is not included in bundle.js
gulp.task('vendor-js', function() {
  return gulp.src(['app/js/vendor/*.js'])
    .pipe(gulp.dest('dist/js/vendor/'));
});

// Dev task
gulp.task('dev', ['html', 'vendor-js', 'css', 'lint', 'img', 'copy-fonts', 'browserify'], function() {
  process.exit(0);
});

gulp.task('watch', ['lint'], function() {
  // Start webserver
  server.listen(serverport);
  // Start live reload
  refresh.listen(livereloadport);

  // Watch our js, and when they change run lint and browserify
  gulp.watch(['app/js/*.js', 'app/js/**/*.js', 'app/modules/*/js/**.js'], [
    'lint',
    'browserify'
  ]);
  // Watch our sass files
  gulp.watch(['app/css/**/*.scss', 'app/modules/**/css/**.scss'], [
    'css'
  ]);

  gulp.watch(['app/html/*.html'], [
    'html'
  ]);

  gulp.watch('./dist/**').on('change', refresh.changed);

});

gulp.task('default', ['clean', 'dev', 'watch']);

