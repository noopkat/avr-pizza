![status not ready](https://img.shields.io/badge/status-alpha-red.svg) ![powered by Azure](https://img.shields.io/badge/powered%20by-Azure%20%E2%98%81%EF%B8%8F-blue.svg)

# avr-pizza
Bespoke, artisinal, **P**recompiler **I**n **ZZ**ee **A**ir

:cloud: :pizza: :cloud: :pizza: :cloud:

:warning: **This is very much in alpha stage at the moment, so use at your own caution. Holler in this repo's issues if you have something unexpected happen if you give this a try. Thanks** :pray: :two_hearts:

## What is this?

Avr-pizza is a tool for compiling Arduino sketch files without needing to have the Arduino IDE and related toolchains installed on your machine. 

It makes use of :sparkles: the cloud :sparkles:. Ask, and ye shall receive a freshly baked, delicious compilation in a timely manner.

### Q: Wait, why is this happening in the cloud again?

A: Glad you asked! A couple of general use cases for leaning on remote compilation:

1. Compile Arduino sketches within a web browser environment (coming soon) :zap:

2. Compile Arduino sketches on users' machines without requiring them to go through downloading and installing the Arduino IDE. This is particularly helpful for nodebots related libraries, which often produce custom sketches tailored to the unique needs of a user setting up their robot. Makes for a less confusing and more friendly 'out of the box' experience all round.

### Q: Can I override 'the cloud' with my local Arduino IDE installation to build on my own machine instead?

A: Yes! See the examples section of this README for details on how to do this.

## Requirements

To use this library, a stable internet connection is required. You'll also need to have [NodeJS](http://nodejs.org) installed on your computer.

## Installation

First, ensure you have [installed NodeJS](http://nodejs.org).

Then, run the following in your preferred terminal program:

```bash
npm install avr-pizza
```

## Examples


### Simple

To compile a simple sketch with no custom library dependencies (such as blink.ino):

```js
var avrpizza = require('avr-pizza');

var package = {
  sketch: '/path/to/blink.ino',
  board: 'uno'
};

avrpizza.compile(package, function(error, hex) {
  console.log(error, hex); // hex = NodeJS Buffer containing hex file contents
});

```

**Note:** `hex` is a NodeJS Buffer. You may then go on to pass this onto your program, or even write it to disk as a `.hex` file.

### With external libraries

To compile a sketch with custom library dependencies, a `libraries` option is needed containing the paths to the top level directory of each library:

```js
var avrpizza = require('avr-pizza');

var package = {
  sketch: '/path/to/mysketch.ino',
  libraries: ['/path/to/customlib1', '/path/to/customlib2'],
  board: 'uno'
};

avrpizza.compile(package, function(error, hex) {
  console.log(error, hex);
});

```

### Skip the cloud and build locally on your own machine instead

Currently, local builds are supported on OSX, Linux, and Windows.

To compile locally, add a `builder` option to your package object. The `location` key should be set to the path where your local installation of the Arduino IDE is located.

Typical installation locations (adjust accordingly - your installation path might differ slightly):

+ OSX: `'/Applications/Arduino.app'`
+ Linux: `'/usr/local/share/arduino-1.6.9'`
+ Windows: `'c:\\Program\ Files\\Arduino'`

Example:

```js
var avrpizza = require('avr-pizza');

var package = {
  sketch: '/path/to/mysketch.ino',
  libraries: ['/path/to/customlib1', '/path/to/customlib2'],
  board: 'uno',
  builder: {
    location: '/Applications/Arduino.app'
  }
};

// avrpizza will now build using `/Applications/Arduino.app`
avrpizza.compile(package, function(error, hex) {
  console.log(error, hex);
});

```

## Package options

You may include the following options in the `package` object passed to the compile method:

### Required
+ _String_ **sketch** - the local path to the sketch file you're looking to compile
 
+ _String_ **board** - the target Arduino board the sketch is to be compiled for. See the supported boards section in this documentation to look up the correct string to supply for your chosen board.

### Optional
+ _Array_ **libraries** - contains local directory paths to any library your sketch uses (optional). Standard Arduino libraries do not need to be included. See standard libraries section in this documentation for the list.

+ _Object_ **builder** - the location of your local installation of the Arduino IDE, only if you wish to compile locally. Contains one key - `location` which should be a path string of where the IDE is located on your hard drive. Eg: `builder: { location: '/Applications/Arduino.app' }`
## CLI

Avr-pizza is also a command line tool! Run it on a sketch and a hex file will be saved to disk.

Install it with:

```bash
npm install -g avr-pizza
```

### Usage

```bash
avr-pizza compile -s <sketch filepath> -l <library dirpath> -a <arduino name> [-o <output path> -b <local IDE path>]
```
You may repeat the `-l` flag as many times as necessary to supply all the library directory paths you need. 

`-o` is optional; if not supplied the hex file will be saved in the current directory.

#### Example
```bash
avr-pizza compile -s /path/to/mysketch.ino -l /path/to/cool/library/dir -a 'uno' -o ~/stuff/pizzas
```

## Supported boards

|Board Name|Option String|
|:----------|:--------------|
|Arduino Uno|`uno`|
|Arduino Mega|`mega`|
|Arduino Leonardo|`leonardo`|
|Arduino Micro|`micro`|
|Arduino Nano|`nano`|
|Arduino Duemilanove|`diecimila`|
|Arduino Yún|`yun`|
|Arduino Pro|`pro`|
|Arduino Mega|`ADKmegaADK`|
|Arduino Esplora|`esplora`|
|Arduino Mini|`mini`|
|Arduino Ethernet|`ethernet`|
|Arduino Fio|`fio`|
|Arduino BT|`bt`|
|LilyPad Arduino USB|`LilyPadUSB`|
|LilyPad Arduino|`lilypad`|
|Arduino NG|`atmegang`|
|Arduino Robot Control|`robotControl`|
|Arduino Robot Motor|`robotMotor`|
|Arduino Gemma|`gemma`|


## Standard Libraries

There is no need to include the standard libraries that ship with Arduino.
To rejog your memory, they are:

+ **EEPROM** - reading and writing to "permanent" storage
+ **Ethernet** - for connecting to the internet using the Arduino Ethernet Shield
+ **Firmata** - for communicating with applications on the computer using a standard serial protocol.
+ **GSM** - for connecting to a GSM/GRPS network with the GSM shield.
+ **LiquidCrystal** - for controlling liquid crystal displays (LCDs)
+ **SD** - for reading and writing SD cards
+ **Servo** - for controlling servo motors
+ **SPI** - for communicating with devices using the Serial Peripheral Interface (SPI) Bus
+ **SoftwareSerial** - for serial communication on any digital pins.
+ **Stepper** - for controlling stepper motors
+ **TFT** - for drawing text , images, and shapes on the Arduino TFT screen
+ **WiFi** - for connecting to the internet using the Arduino WiFi shield
+ **Wire** - Two Wire Interface (TWI/I2C) for sending and receiving data over a net of devices or sensors.

If the only libraries you make use of in your sketch are included in the list above, you may leave out the `libraries` key in your `avrpizza.compile` package options.

## License

MIT

## Privacy

You may read this software's [privacy policy](PRIVACY.md).

