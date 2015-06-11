var gulp = require('gulp'),
    del = require('del')

gulp.task('clean', [], function(cb) {
  del([
      'public/app-*.js',
      'public/rev-manifest.json',
      'public/index.html'
  ], cb)
})

