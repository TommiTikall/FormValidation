// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var compass = require('gulp-compass');

var scriptPath = 'javascripts';
var scriptFiles = [
    scriptPath + '/utils/_debug-log.js',
    scriptPath + '/partials/_global.js',
    scriptPath + '/partials/_formvalidation.js',
    scriptPath + '/main.js'
]

// Lint Task
gulp.task('lint', function() {
    return gulp.src('javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('scss/main.scss')
        // .pipe(sass())
        .pipe(compass({
             config_file: './config.rb',
             css: 'dist/css',
             sass: 'scss'
           }))
        .pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src( scriptFiles )
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('main-min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('javascripts/**/*.js', ['lint', 'scripts']);
    gulp.watch('scss/**/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);