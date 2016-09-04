var babelify = require('babelify');
var browserify = require('browserify');
var exec = require('child_process').exec;
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var fs = require('fs');
var path = require('path');
var sequence = require('run-sequence');
var server = require('gulp-server-livereload');

var config = {
  isWatching: false,
  port: gutil.env.port !== undefined ? gutil.env.port : 8000
};

function src() {
  return '';
}

function dest() {
  return 'built/';
}

function onError(err) {
  notify.onError({
    title:    "Gulp Error",
    subtitle: "",
    message:  "<%= error.message %>",
    sound:    "Beep"
  })(err);
  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src(src() + 'js/*.js')
    .pipe(plumber({errorHandler: onError}))
    .pipe(eslint({
      parser: "babel-eslint",
      globals: "",
      es6: true,
      modules: true,
      commonjs: true,
      jsx: true,
      rules: {
        strict: 0,
        quotes: [2, "single"],
        semi: [2, "always"],
     }
    }))
    .pipe(eslint.formatEach())
    .pipe(notify(function (file) {
      if (file.eslint.errorCount === 0) return false;
      return {
        title: file.relative + " (" + file.eslint.errorCount + " errors)",
        message: "Gulp ESLint"
      };
    }));
});

gulp.task('sass', function() {
  return gulp.src(src() + 'scss/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({
      style: 'compressed',
      includePaths: require('node-bourbon').includePaths
    }))
    .on('error', notify.onError(function (error) {
      return "Error: <%=error.message%>";
    }))
    .pipe(gulp.dest(dest() + 'css'))
    .pipe(notify({
      title: "Gulp SASS",
      message: "Generated: <%= file.relative %>"})
    );
});

function browserifyTask(entry, out, cb) {
  var bundler = browserify({
    entries: [entry],
    extensions: ['.js', '.jsx'],
    cache: {},
    debug: true,
    packageCache: {},
    fullPaths: true
  })
  .transform(babelify.configure({
    presets: ["es2015", "react", "stage-1"]
  }))
  .transform('glslify')
  .transform({ global: true }, gutil.noop);

  if (config.isWatching) {
    bundler = watchify(bundler);
    cb();
  }

  var rebundle = function() {
    return bundler
      .bundle()
      .on('error', notify.onError(function (error) {
        return "Error: <%=error.message%>";
      }))
      .pipe(source(out + 'tmp.js'))
      .pipe(rename(out))
      .pipe(gulp.dest(dest() + 'js'))
      .on('end', gutil.noop)
      .pipe(notify({
        title: "Gulp " + (config.isWatching ? 'Watchify' : 'Browserify'),
        message: "Generated: <%= file.relative %>"})
      )
  };

  if (config.isWatching) bundler.on('update', rebundle);
  rebundle();
}

gulp.task('browserify', ['lint'], function(cb) {
  var s = path.join(src(), 'js/main.jsx');
  if (!fs.existsSync(s))
    s = path.join(src(), 'js/main.js');
  browserifyTask(s, 'bundle.js', cb);
});

gulp.task('watch', function() {
  config.isWatching = true;
  gulp.watch(path.join(src(), 'js/**/*.js'), ['lint']);
  gulp.watch(path.join(src(), 'scss/**/*.scss'), ['sass']);
  gulp.start('browserify');
});
 
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(server({
      livereload: {
        enable: true,
        filter: function (filename, cb) {
          /*
            Reload only if the changed file is:
              in /assets
              in /built
              index.html
          */
          cb(/assets\/|built\/|index\.html$/.test(filename));
        }
      },
      open: true,
      port: config.port
    }));
});

gulp.task('default', ['lint', 'sass', 'browserify', 'watch']);
gulp.task('live', function() {
  sequence('default', 'webserver');
});