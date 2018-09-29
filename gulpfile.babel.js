import gulp from 'gulp'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'

const build = () => {
  return gulp.src('src/**/*.js')  
    .pipe(babel({
      presets: ['es2015'],
      ignore: ["node_modules"]
    }))
    .pipe(uglify())
    .pipe(concat('wire.min.js'))
    .pipe(gulp.dest('dist'))

}

const defaultTasks = gulp.parallel(build)

export {
  build
}

export default defaultTasks
