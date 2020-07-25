#!/usr/bin/env node

const fs            = require('fs');
const PassThrough   = require('stream').PassThrough;
const navigator     = require('jzz');
const onDeath       = require('death');
const ChordAnalyzer = require('./Analyzer.js');

// write the output to this file
const filename = process.argv[2] || 'nLibrary.js';

// This main output stream will be split, and sent to both stdout and a file
const outputStream = new PassThrough();
const fileStream   = fs.createWriteStream(filename);
outputStream.pipe(process.stdout);
outputStream.pipe(fileStream);

console.error(
`// Listening for MIDI chords on all MIDI interfaces
// Default output file is "nLibrary.js". Pass in a filename to override:
// $ make-nlib out.js
`);

// Setup the header and footer
outputStream.write(`const nLibrary = {\n`)
onDeath(() => {
  outputStream.write(`};\n`);
  process.exit();
});

const analyzer = new ChordAnalyzer(outputStream);

// Annoying Midi Boilerplate
if (!navigator.requestMIDIAccess) {
  console.log("MIDI is not supported in your environment");
} else { navigator.requestMIDIAccess({
    sysex: false // this defaults to 'false' in the browser
  }).then(midiAccess => {
    const inputs = midiAccess.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      // each time there is a midi message call the onMIDIMessage function
      input.value.onmidimessage = (event)=> {
        // jzz silently ignores errors in callbacks, so we log them explicitly.
        try {
          if (event.data) analyzer.parser.parseArray(event.data);
        } catch (error) {
          console.error(error)
          throw error;
        }
      }
      input.value.onstatechange = (event)=> {
        /* Fires when MIDI devices plugged and unplugged */
        const name = event.port.name;
        const man  = event.port.manufacturer;
        const state = event.port.state;
      }
    }
  }, (reason)=> {
    console.log('failed to get midi access:', reason);
  });
};
