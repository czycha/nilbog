const gulp = require('gulp')
const babel = require('gulp-babel')
const gulpWebpack = require('webpack-stream')
const webpack = require('webpack')
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
    .pipe(babel())
    .pipe(gulp.dest('dist'))
))

gulp.task('webpack', () => (
  gulp.src('test/browser.js')
    .pipe(gulpWebpack({
      output: {
        filename: 'browser.min.js'
      },
      mode: 'production',
      devtool: 'source-map'
    }, webpack))
    .pipe(gulp.dest('test'))
))

gulp.task('js:prod', gulp.series(['lint', 'babel']))

gulp.task('babel:watch', () => (
  gulp.watch('src/**/*.js', gulp.series('babel'))
))

gulp.task('js:dev', gulp.series(['babel', 'webpack']))

gulp.task('webpack:watch', () => (
  gulp.watch(['test/browser.js', 'dist/**/*.js'], gulp.series('webpack'))
))

gulp.task('js:dev:watch', gulp.parallel('babel:watch', 'webpack:watch'))

gulp.task('default', gulp.series(['js:dev:watch']))
