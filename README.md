![status not ready](https://img.shields.io/badge/status-alpha-red.svg)

# avr-pizza
Bespoke, artisinal, **P**recompiler **I**n **ZZ**ee **A**ir

:cloud: :pizza: :cloud: :pizza: :cloud:

## What is this?

Avr-pizza is a tool for compiling Arduino sketch files without needing to have the Arduino IDE and related toolchains installed on your machine. 

It makes use of :sparkles: the cloud :sparkles:. Ask, and ye shall receive a freshly baked, delicious compilation in a timely manner.

:warning: **This is very much in alpha stage at the moment, so use at your own caution. Holler in this repo's issues if you have something unexpected happen if you give this a try. Thanks** :pray: :two_hearts:

## Installation

First, ensure you have [installed NodeJS](http://nodejs.org).

Then, run the following in your preferred terminal program:

```bash
npm install avr-pizza
```

## Requirements

To use this library, a stable internet connection is required.

## Example


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

To compile a simple sketch custom library dependencies, a `libraries` option is needed containing the paths to the top level directory of each library:

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

## Package options

You may include the following options in the `package` object passed to the compile method:

+ _String_ **sketch** - the local path to the sketch file you're looking to compile (required)
 
+ _Array_ **libraries** - contains local directory paths to any library your sketch uses (optional). Standard Arduino libraries do not need to be included. See standard libraries section in this documentation for the list.
 
+ _String_ **board** - the target Arduino board the sketch is to be compiled for (required). See the supported boards section in this documentation to look up the correct string to supply for your chosen board.

## CLI

Avr-pizza is also a command line tool! Run it on a sketch and a hex file will be saved to disk.

Install it with:

```bash
npm install -g avr-pizza
```

### Usage

```bash
avrpizza compile -s <sketch filepath> -l <library dirpath> -a <arduino name> [-o <output path>]
```
You may repeat the `-l` flag as many times as necessary to supply all the library directory paths you need. 

`-o` is optional; if not supplied the hex file will be saved in the current directory.

#### Example
```bash
avrpizza compile -s /path/to/mysketch.ino -l /path/to/cool/library/dir -a 'uno' -o ~/stuff/pizzas
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



