var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    rev = require('gulp-rev'),
    buffer = require('gulp-buffer')

gulp.task('app', [], function() {
	return browserify('client/index.js')
	  .bundle()
	  .pipe(source('app.js'))
          .pipe(buffer())
          .pipe(rev())
	  .pipe(gulp.dest('public'))
})

gulp.task('default', ['app'])
