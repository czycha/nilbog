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

gulp.task('test', () => (
  gulp.src('browser/nilbog.min.js')
    .pipe(gulp.dest('test/browser/js'))
))

gulp.task('webpack', () => (
  gulp.src('dist/index.js')
    .pipe(gulpWebpack({
      output: {
        filename: 'nilbog.min.js',
        library: 'Nilbog'
      },
      mode: 'production'
    }, webpack))
    .pipe(gulp.dest('browser'))
))

gulp.task('js:prod', gulp.series(['lint', 'babel', 'webpack']))

gulp.task('babel:watch', () => (
  gulp.watch('src/**/*.js', gulp.series('babel'))
))

gulp.task('js:dev', gulp.series(['babel', 'webpack', 'test']))

gulp.task('webpack:watch', () => (
  gulp.watch(['dist/**/*.js'], gulp.series('webpack'))
))

gulp.task('test:watch', () => (
  gulp.watch(['browser/nilbog.min.js'], gulp.series('test'))
))

gulp.task('js:dev:watch', gulp.parallel('babel:watch', 'webpack:watch', 'test:watch'))

gulp.task('default', gulp.series(['js:dev:watch']))
