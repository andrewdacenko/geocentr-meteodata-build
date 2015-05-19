var NwBuilder = require('node-webkit-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');
var rimraf = require('gulp-rimraf');
var argv = require('yargs').argv;
var evb = require("enigmavirtualbox");

var availablePlatforms = ['osx32', 'osx64', 'win32', 'win64', 'linux32', 'linux64'];

var config = {
  version: '0.11.6',
  files: './geocentr-meteodata/**',
  winIco: './icons/geocentr.ico',
  macIcns: './icons/geocentr.icns',
  macPlist: {
    mac_bundle_id: 'Geocentr'
  }
};

gulp.task('clean:nw', function() {
  return gulp.src('build/*', {
      read: false
    })
    .pipe(rimraf({
      force: true
    }));
});

gulp.task('nw', ['clean:nw'], function(done) {
  var platforms = ('' + argv.p).split(',').forEach(function(p) {
    if (availablePlatforms.indexOf(p) !== -1) {
      gulp.start('nw:' + p);
    }
  });

  done();
});

availablePlatforms.forEach(function(platform) {
  gulp.task('clean:nw:' + platform, function() {
    return gulp.src('build/geocentr/' + platform + '/*', {
        read: false
      })
      .pipe(rimraf({
        force: true
      }));
  });

  gulp.task('nw:' + platform, ['clean:nw:' + platform], function() {
    var conf = Object.keys(config).reduce(function(o, k) {
      return o[k] = config[k], o;
    }, {
      platforms: [platform]
    });

    var nw = new NwBuilder(conf);

    // Log stuff you want
    nw.on('log', function(msg) {
      gutil.log('node-webkit-builder', msg);
    });

    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function(err) {
      gutil.log('node-webkit-builder', err);
    });
  })
})

gulp.task('box', ['box32', 'box64']);

gulp.task('box64', ['nw:win64'], function() {
  var res = ['geocentr.evp', 'geocentr.exe'].map(function(i) {
    return './release/win64/' + i;
  }).concat(['geocentr.exe',
    'nw.pak', 'icudtl.dat', 'ffmpegsumo.dll', 'libEGL.dll',
    'libGLESv2.dll'
  ].map(function(i) {
    return './build/geocentr/win64/' + i;
  }));

  return evb.gen.apply(null, res).then(function(r) {
    return evb.cli(res[0]).catch(function(err) {
      gutil.log('enigma', err);
    });
  }).catch(function(err) {
    gutil.log('enigma', err);
  });
});

gulp.task('box32', ['nw:win32'], function() {
  var res = ['geocentr.evp', 'geocentr.exe'].map(function(i) {
    return './release/win32/' + i;
  }).concat(['geocentr.exe',
    'nw.pak', 'icudtl.dat', 'ffmpegsumo.dll', 'libEGL.dll',
    'libGLESv2.dll'
  ].map(function(i) {
    return './build/geocentr/win32/' + i;
  }));

  return evb.gen.apply(null, res).then(function(r) {
    return evb.cli(res[0]).catch(function(err) {
      gutil.log('enigma', err);
    });
  }).catch(function(err) {
    gutil.log('enigma', err);
  });
});

gulp.task('default', ['box']);
