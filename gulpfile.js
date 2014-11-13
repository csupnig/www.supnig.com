/* global require */
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var bump = require('gulp-bump');
var fs = require('fs');
var ngmin = require('gulp-ngmin');


var getVersion = function(callback) {
  var file = './version.json';
  var data = fs.readFileSync(file).toString();
  data = JSON.parse(data);
  console.dir('Version: ' + data.version);
  callback(data.version);
};

gulp.task('lint',['browserify'], function() {
  getVersion(function(v){
    gulp.src('./public/javascripts/dev/bundle-'+v+'.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });
});

gulp.task('clean', function() {
  getVersion(function(v){
    gulp.src('./public/javascripts/*.js', {read: false})
        .pipe(clean());
    gulp.src('./public/javascripts/dev/*.js', {read: false})
        .pipe(clean());
    gulp.src('./public/css/*.css', {read: false})
        .pipe(clean());
  });
});

gulp.task('browserify',['versionbump'], function() {
    getVersion(function(v){
      gulp.src(['./frontend/main.js'])
          .pipe(browserify({
            insertGlobals : true,
            debug : true
          }))
          //.pipe(ngmin())
          .pipe(concat('bundle-'+v+'.js'))
          .pipe(gulp.dest('./public/javascripts/dev/'))
          //.pipe(uglify({mangle: false}))
          .pipe(uglify())
          .pipe(gulp.dest('./public/javascripts/'));
    });
});

gulp.task('example', function(){
    gulp.src(['./frontend/examples.js'])
      .pipe(browserify({
          insertGlobals : true,
          debug : false,
          ignore:['msgpack']
        }))
      .pipe(concat('example_build.js'))
      .pipe(uglify({}))
      .pipe(gulp.dest('./public/javascripts/'));
    gulp.src(['./frontend/examples.js'])
      .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('minify-css',['versionbump'], function() {
  getVersion(function(v){
    gulp.src(['./frontend/lib/nvd3/src/nv.d3.css','./frontend/css/fontello/css/fontello.css','./frontend/css/*.css'])
      .pipe(minifyCSS({}))
      .pipe(concat('main-'+v+'.css'))
      .pipe(gulp.dest('./public/css/'));
  });
});

gulp.task('copytemplate',['versionbump'], function() {
  gulp.src('./frontend/strategies/StrategyTemplate.js')
    .pipe(gulp.dest('./public/javascripts/'));
});

// Defined method of updating:
// Semantic
gulp.task('versionbump', function(){
  return gulp.src('./version.json')
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

gulp.task('release', function() {
  return gulp.src('./version.json')
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('default', function(){
  gulp.run('versionbump','clean', 'browserify', 'lint', 'minify-css', 'copytemplate', 'example');
});