var requestComp = require('./lib/request');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var tar = require('tar-stream');

module.exports = {};

module.exports.compile = function avrpizza(package, callback) {
  var libpaths = package.libraries || [];
  var sketchfile = package.sketch;
  var board = package.board || 'uno';
  var version = package.version || '10609';

  // perpare a new tarball packing
  var pack = tar.pack();

  // we def needs these top level dirs, let's guarantee that happens
  pack.entry({name: 'libs', type: 'directory'});
  pack.entry({name: 'dist', type: 'directory'});
  pack.entry({name: 'sketch', type: 'directory'});

  // glob library and sketch file dirs
  libpaths.forEach(function(libpath) {
    // look for needed files within library dir
    var matches = glob.sync("**/{*.h,*.cpp,*.c}", {cwd: libpath, root: path.join(libpath, '/'), matchBase: true});

    // save each file into the tarball pack
    matches.forEach(function(filepath) {
      var libName = path.basename(libpath);
      var filecontent = fs.readFileSync(path.join(libpath, filepath), {encoding: 'utf8'});
      pack.entry({name: path.join('libs', libName, filepath)}, filecontent);
    });
  });

  var sketchpath = path.dirname(sketchfile);
  // glob through the sketch directory to find likely file deps
  var matches = glob.sync("**/{*.h,*.cpp,*.c}", {cwd: sketchpath, root: path.join(sketchpath, '/'), matchBase: true});

  // save each file into the tarball pack
  matches.forEach(function(filepath) {
    var filecontent = fs.readFileSync(path.join(sketchpath, filepath), {encoding: 'utf8'});
    pack.entry({name: path.join('sketch', filepath)}, filecontent);
  });

  // save the main sketch file to a special filename that the compiler can look for
  fs.readFile(sketchfile, {encoding: 'utf8'}, function(error, sketchfile) {
    pack.entry({name: path.join('sketch', 'sketch.ino')}, sketchfile);

    // we're done with the tarball
    pack.finalize();

    // now we're ready to request compilation by throwing over the tarball to the request side
    requestComp({files: pack, board: board, version: version, service: package.service}, function(error, data) {
      return callback(error, data);
    });
  });
};
