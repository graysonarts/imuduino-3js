var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    rev = require('gulp-rev'),
    buffer = require('gulp-buffer'),
    revReplace = require('gulp-rev-replace')

gulp.task('pyr-app', [], function() {
	return browserify('client/pyr.js')
	  .bundle()
	  .pipe(source('pyr.js'))
          .pipe(buffer())
          .pipe(rev())
	  .pipe(gulp.dest('public'))
          .pipe(rev.manifest())
          .pipe(gulp.dest('public'))
})

gulp.task('revreplace', ['pyr-app'], function() {
  var manifest = gulp.src('./public/rev-manifest.json')

  return gulp.src('./client/*.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('public'))
})

gulp.task('default', ['revreplace'])
