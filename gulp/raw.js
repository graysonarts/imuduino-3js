var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    rev = require('gulp-rev'),
    buffer = require('gulp-buffer'),
    revReplace = require('gulp-rev-replace')

gulp.task('raw-app', [], function() {
	return browserify('client/raw.js')
	  .bundle()
	  .pipe(source('raw.js'))
          .pipe(buffer())
          .pipe(rev())
	  .pipe(gulp.dest('public'))
          .pipe(rev.manifest('raw-manifest.json'))
          .pipe(gulp.dest('public'))
})

gulp.task('raw', ['raw-app', 'epoch'], function() {
  var manifest = gulp.src('./public/raw-manifest.json')

  return gulp.src('./client/raw.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('public'))
})
