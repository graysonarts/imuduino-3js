var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    buffer = require('gulp-buffer')

gulp.task('playback-samples', [], function() {
  return gulp.src('./samples/*.imurec')
    .pipe(gulp.dest('public/playback/samples'))
})

gulp.task('playback-app', [], function() {
	return browserify('client/playback/playback.js')
	  .bundle()
	  .pipe(source('playback.js'))
          .pipe(buffer())
	  .pipe(gulp.dest('public/playback'))
})

gulp.task('playback', ['playback-app', 'playback-samples'], function() {
  return gulp.src('./client/playback/index.html')
    .pipe(gulp.dest('public/playback'))
})
