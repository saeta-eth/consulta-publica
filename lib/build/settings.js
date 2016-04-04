var argv = require('yargs').argv;
var production = 'production' === process.env.NODE_ENV || argv.production;

var settings = {};
settings.public = './public/';
settings.clientEntryPoint = './lib/boot/boot.js';
settings.stylEntryPoint = './lib/boot/boot.styl';
settings.verbose = !!argv.verbose;
settings.sourcemaps = argv.sourcemaps && !production;
settings.minify = argv.minify;
settings.production = production;
settings.livereload = argv.livereload && !production;

module.exports = settings;
