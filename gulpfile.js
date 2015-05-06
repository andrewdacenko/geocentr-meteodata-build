var NwBuilder = require('node-webkit-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');
var evb = require("enigmavirtualbox");

gulp.task('nw', function () {

    var nw = new NwBuilder({
        version: '0.11.6',
        files: './geocentr-meteodata/**',
        winIco: './icons/geocentr.ico',
        macIcns: './icons/geocentr.icns',
        macPlist: {
            mac_bundle_id: 'Geocentr'
        },
        platforms: ['win32', 'win64']
    });

    // Log stuff you want
    nw.on('log', function (msg) {
        gutil.log('node-webkit-builder', msg);
    });

    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function (err) {
        gutil.log('node-webkit-builder', err);
    });
});

gulp.task('box', ['box32', 'box64']);

gulp.task('box64', ['nw'], function () {
    var res = ['geocentr.evp', 'geocentr.exe'].map(function (i) {
        return './release/win64/' + i;
    }).concat(['geocentr.exe',
        'nw.pak', 'icudtl.dat', 'ffmpegsumo.dll', 'libEGL.dll',
        'libGLESv2.dll'
    ].map(function (i) {
        return './build/geocentr/win64/' + i;
    }));

    return evb.gen.apply(null, res).then(function (r) {
        return evb.cli(res[0]).catch(function (err) {
            gutil.log('enigma', err);
        });
    }).catch(function (err) {
        gutil.log('enigma', err);
    });
});

gulp.task('box32', ['nw'], function () {
    var res = ['geocentr.evp', 'geocentr.exe'].map(function (i) {
        return './release/win32/' + i;
    }).concat(['geocentr.exe',
        'nw.pak', 'icudtl.dat', 'ffmpegsumo.dll', 'libEGL.dll',
        'libGLESv2.dll'
    ].map(function (i) {
        return './build/geocentr/win32/' + i;
    }));

    return evb.gen.apply(null, res).then(function (r) {
        return evb.cli(res[0]).catch(function (err) {
            gutil.log('enigma', err);
        });
    }).catch(function (err) {
        gutil.log('enigma', err);
    });
});

gulp.task('default', ['box']);