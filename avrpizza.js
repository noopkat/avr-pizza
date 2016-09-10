var remoteComp = require('./lib/request');
var localComp = require('avrp-local');
var packager = require('./lib/packager');
var boards = require('./lib/boards');

module.exports.compile = function compile(package, callback) {
   // lets get rid of this for now until the board archs are settled on
  // if (boards.indexOf(package.board) === -1) {
  //   return callback(new Error('Oops! That board is not supported, sorry.'));
  // }

  var builder = package.builder || null;

  // look for presence of local builder preference specified
  if (builder && builder.location) {
    // do local build
    localComp.requestCompilation(package, callback);
  } else {
    // do remote build
    packager.prepare(package, function(error, pack) {
      if (error) return callback(error);

      var board = package.board || 'uno';
      var version = package.version || '10609';
      var manufacturer = package.manufacturer || 'arduino';
      var arch = package.arch || 'avr';

      // now we're ready to request compilation by throwing over the tarball to the request side
      remoteComp.requestCompilation(
        {
          files: pack,
          board: board,
          version: version,
          service: package.service,
          manufacturer: manufacturer,
          arch: arch
        },
        function(error, data) {
          var result = error ? null : new Buffer(data.data.src);

          return callback(error, result);
        }
      );
    });
  }
};
