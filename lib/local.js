var child = require('child_process');
var path = require('path');
var mkdirp = require('mkdirp');
var uuid = require('node-uuid');
var rimraf = require('rimraf');
var os = require('os');
var fs = require('fs');

module.exports.requestCompilation = function(package, callback) {
  var libpaths = package.libraries || [];
  var sketchfile = path.resolve(package.sketch);
  var board = package.board || 'uno';
  var version = package.version || '10609';
  var builder = package.builder;

  var id = uuid.v1();
  var paths = {};
  paths.dest = path.join(os.homedir(), '.avrpizza', 'tmp', id);

  mkdirp(paths.dest);

  var customLibsArgs = libpaths.map(function(lpath) {
    return '-libraries=' + path.resolve(lpath);
  });

  switch (os.platform()) {
    case 'darwin': {
      // theoretically the user would supply the direct path to the Arduino.app location, including the app file in the path
      builderPath = path.join(builder.location, 'Contents', 'Java');
      paths.tools = path.join(builderPath, 'hardware', 'tools');
      paths.libs =  path.join(builderPath, 'libraries');
      paths.hardware = path.join(builderPath, 'hardware');
      paths.toolsBuilder = path.join(builderPath, 'tools-builder');
      break;
    }

    case 'linux': {
      builderPath = path.resolve(builder.location);
      paths.tools = path.join(builderPath, 'hardware', 'tools');
      paths.libs =  path.join(builderPath, 'libraries');
      paths.hardware = path.join(builderPath, 'hardware');
      paths.toolsBuilder = path.join(builderPath, 'tools-builder');
      break;
    }

    case 'win32': {
      // TODO: check what this is by installing arduino on windows box
      // TODO: find tools, hardware, buildertools, and lib paths
      // builderPath = path.resolve(builder.location);
      var error = new Error('Oops! Sorry, local build is currently an unsupported feature on Windows, check back soon.');
      return callback(error);
      break;
    }

    default: {
      var error = new Error('Oops! Sorry, local build is currently an unsupported feature on your platform, check back soon.');
      return callback(error);
      break;
    }
  }

  function compile(callback) {

    // assemble all options and flags for Arduino Builder based on the facts
    var builderString = [
      '-compile',
      '-hardware=' + paths.hardware,
      '-tools=' + paths.tools,
      '-tools=' + paths.toolsBuilder,
      '-fqbn=arduino:avr:' + board,
      '-built-in-libraries=' + libsPath,
      customLibsArgs.join(' '),
      '-ide-version=' + version,
      '-build-path=' + paths.dest,
      '-debug-level=10',
      // '-warnings=none',
      path.resolve(sketchfile)
    ].join(' ');

    // run Arduino Builder in a child process (yay cmd line apps)
    var builderChild = child.exec(path.join(builderPath, 'arduino-builder') + ' ' + builderString, function(error) {
      // something went wrong
      if (error) return callback(error);

      // open the compiled file to send the buffer with callback
      fs.readFile(path.join(paths.dest, path.basename(sketchfile)) + '.hex', function(error, file) {
        // delete the temp build directory
        rimraf(paths.dest, function(error) {
          return callback(error, file);
        });
      });
    });
  }

  compile(callback);
}
