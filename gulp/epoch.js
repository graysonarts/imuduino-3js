var gulp = require('gulp')

gulp.task('epoch', function() {
  return gulp.src([
      'contrib/epoch/epoch.min.css'
    ])
    .pipe(gulp.dest('public'))
})
