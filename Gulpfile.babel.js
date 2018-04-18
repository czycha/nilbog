const gulp = require('gulp')
const babel = require('gulp-babel')
const webpack = require('webpack-stream')
const eslint = require('gulp-eslint')

gulp.task('lint', () => (
  gulp.src('src/**/*.js')
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(gulp.dest('src'))
))

gulp.task('babel', () => (
  gulp.src('src/**/*.js')
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(babel({
      "presets": ["env"],
      "comments": false,
      "plugins": ["transform-function-bind"]
    }))
    .pipe(gulp.dest('dist'))
))

gulp.task('webpack', () => (
  gulp.src('dist/test.js')
    .pipe(webpack({
      output: {
        filename: 'test.js'
      }
    }))
    .pipe(gulp.dest('browser'))
))

gulp.task('js:prod', gulp.series(['lint', 'babel']))

gulp.task('js:dev', gulp.series(['babel', 'webpack']))

gulp.task('js:watch', () => (
  gulp.watch('src/**/*.js', gulp.series('babel', 'webpack'))
))

gulp.task('default', gulp.series(['js:watch']))
