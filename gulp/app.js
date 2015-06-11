var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    rev = require('gulp-rev'),
    buffer = require('gulp-buffer'),
    revReplace = require('gulp-rev-replace')

gulp.task('app', [], function() {
	return browserify('client/index.js')
	  .bundle()
	  .pipe(source('app.js'))
          .pipe(buffer())
          .pipe(rev())
	  .pipe(gulp.dest('public'))
          .pipe(rev.manifest())
          .pipe(gulp.dest('public'))
})

gulp.task('revreplace', ['app'], function() {
  var manifest = gulp.src('./public/rev-manifest.json')

  return gulp.src('./client/index.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('public'))
})

gulp.task('default', ['revreplace'])
