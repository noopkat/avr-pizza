#!/usr/bin/env node
var avrpizza = require('../avrpizza');
var boards = require('../lib/boards');
var parseArgs = require('minimist');
var path = require('path');
var fs = require('fs');

var args = (process.argv.slice(2));
var argv = parseArgs(args, {});
var userAction = argv._[0];
var help = 'Usage:\n' +
  '  avrpizza compile -s <sketch filepath> -l <library dirpath> -a <arduino name> [-o <output path> -b <local ide path>]\n' +
  '  avrpizza help\n';

function showHelp() {
  console.log(help);
}

function compile(options) {
  options.sketch = path.resolve(process.cwd(), options.sketch);
  options.libraries.forEach(function(l, i) {
    options.libraries[i] = path.resolve(process.cwd(), l);
  });
  options.output = path.resolve(process.cwd(), options.output);

  avrpizza.compile(options, function(error, hex) {
    if (error) {
      console.error(error);
      process.exit(1);
    } else {
      var hexfilename = path.basename(options.sketch);
      var savelocation = path.join(options.output, hexfilename + '.hex');
      // create write stream for entry file
      var ws = fs.createWriteStream(savelocation);
      //write file
      ws.write(hex);
    }
  });
}

function handleInput(action, argz) {
  switch (action) {
    case 'compile': {
      if (!argz.s || !argz.a) {
        showHelp();
        process.exit(1);
       // lets get rid of this for now until the board archs are settled on
      // } else if (boards.indexOf(argz.a) === -1) {
      //   console.error(new Error('Oops! That board is not supported, sorry.'));
      //   process.exit(1);
      } else {
        // run compile function here if all is well
        var options = {
          libraries: argz.l || [],
          sketch: argz.s,
          board: argz.a,
          version: argz.c || '',
          output: argz.o || './',
          debug: argz.v || false
        };

        if (argz.b) {
          options.builder = {
            location: argz.b
          }
        }

        compile(options);
      }

      break;
    }

    case 'help': {
      showHelp();
      process.exit();
      break;
    }

    default: {
      // Invalid or no argument specified, show help and exit with an error status
      showHelp();
      process.exit(9);
      break;
    }
  }
}

handleInput(userAction, argv);

