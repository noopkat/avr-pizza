var requestComp = require('./request');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var tar = require('tar-stream');
var async = require('async');

module.exports.prepare = function prepare(package, callback) {
  var libpaths = package.libraries || [];
  var sketchfile = package.sketch;
  var board = package.board || 'uno';
  var version = package.version || '10609';
  var service = package.service || null;

  // if user supplies a string path, just convert it into an array without burdening them with an error
  if (typeof libpaths === 'string') {
    libpaths = [libpaths];
  }

  // create array of paths to iterate on
  // end result looks something like:
  // [
  //   ['/path/to/sketch/dir', 'sketch'],
  //   ['/path/to/lib1', 'libs'],
  //   ['/path/to/lib2', 'libs']
  // ]
  // push sketch dir first
  var globPaths = [[path.dirname(sketchfile), 'sketch']];
  // if there are libraries included, push them to list
  libpaths.forEach(function(lib) {
    globPaths.push([lib, 'libs']);
  });

  // prepare a new tarball packing
  var pack = tar.pack();

  // we def needs these top level dirs, let's guarantee that happens
  pack.entry({name: 'libs', type: 'directory'});
  pack.entry({name: 'dist', type: 'directory'});
  pack.entry({name: 'sketch', type: 'directory'});
  
  async.each(globPaths, findAndPackDependencies, function(error) {
    if (error) return callback(error);

    // finally, pack the sketch file itself
    packSketch(sketchfile, function(error) {
      if (error) return callback(error);

      // we're done with the tarball
      pack.finalize();

      return callback(error, pack);
    });
  });

  function findDependencies(location, callback) {
    var searchPath = location[0];
    var destPath = location[1];

    // look for needed files within library dir
    // TODO: look into changing root in options to full path
    glob("**/*+(.h|.cpp|.c|.hpp)", {ignore: '**/node_modules/**/*+(.h|.cpp|.c|.hpp)', cwd: searchPath, matchBase: true}, function(error, matches) {
      var error = null;
      if (!matches.length && destPath === 'libs') error = new Error('No library files found in supplied path: ' + searchPath);
      return callback(error, matches);
    });
  }

  function packDependencies(matches, location, callback) {
    if (!matches.length) return callback(null);

    var basepath = location[0];
    var destpath = location[1];

    // save each file into the tarball pack
    matches.forEach(function(filepath, index, arr) {

      var libName = destpath === 'sketch' ? '' : path.basename(basepath);

      fs.readFile(path.join(basepath, filepath), {encoding: 'utf8'}, function(error, filecontent) {
        if (error) return callback(error);

        // pack file into tarball
        pack.entry({name: path.posix.join(destpath, libName, filepath)}, filecontent);

        // return async if we're done
        if (arr.length - 1 === index) return callback(null);

      });
    });
  }

  function findAndPackDependencies(location, callback) {
    // find files that we can pack into the tarball for compilation
    findDependencies(location, function(error, matches) {
      if (error) return callback(error);

      // send matching files to be packed into tarball
      packDependencies(matches, location, function(error) {
        return callback(error);
      });
    });
  }

  function packSketch(sketchfile, callback) {
    // save the main sketch file to a special filename that the compiler can look for
    fs.readFile(sketchfile, {encoding: 'utf8'}, function(error, sketchfile) {
      if (error) return callback(new Error(error.message));

      pack.entry({name: path.posix.join('sketch', 'sketch.ino')}, sketchfile);

      return callback(null);
    });
  }
};
