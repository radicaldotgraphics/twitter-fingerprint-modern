'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  browserify = require('gulp-browserify'),
  concat = require('gulp-concat'),
  rimraf = require('gulp-rimraf'),
  sass = require('gulp-ruby-sass'),
  rimraf = require('gulp-rimraf'),
  autoprefixer = require('gulp-autoprefixer');

// Modules for webserver and livereload
var express = require('express'),
  refresh = require('gulp-livereload'),
  livereload = require('connect-livereload'),
  livereloadport = 35729,
  serverport = 5000;

// Set up an express server (not starting it yet)
var server = express();
// Add live reload
server.use(livereload({
  port: livereloadport
}));

// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendfile('index.html', {
    root: 'dist'
  });
});

// Clean task
gulp.task('clean', function(cb) {
  rimraf('./dist', cb);
});

gulp.task('html', function() {
  gulp.src(['app/html/*.html'])
    .pipe(jshint())
    .pipe(gulp.dest('dist/'));
});

// JSHint task
gulp.task('lint', function() {
  gulp.src(['app/js/*.js', '!app/js/vendor/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// css task
gulp.task('css', function() {

  gulp.src(['app/css/main.scss', 'app/modules/**/css/**.scss'])
    // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
    .pipe(sass({
      sourcemap: true,
      sourcemapPath: '../scss'
    }))
    // Optionally add autoprefixer
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 9'))
    // These last two should look familiar now :)
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css/'));

});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out)
  gulp.src('app/js/main.js')
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
  gulp.src(['app/js/vendor/*.js'])
    .pipe(gulp.dest('dist/js/vendor/'));
});

// Dev task
gulp.task('dev', ['html', 'vendor-js', 'css', 'lint', 'img', 'browserify'], function() {});

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
