#!/usr/bin/env node

const fs            = require('fs');
const PassThrough   = require('stream').PassThrough;
const navigator     = require('jzz');
const onDeath       = require('death');
const ChordAnalyzer = require('./Analyzer.js');

// write the output to this file
const defaultFilename = 'nLibrary.js';
const filename = process.argv[2] || defaultFilename;

// This main output stream will be split, and sent to both stdout and a file
const outputStream = new PassThrough();
const fileStream   = fs.createWriteStream(filename);
outputStream.pipe(process.stdout);
outputStream.pipe(fileStream);

console.log(
`Usage: $ make-nlib out.js # (Currently writing to "${filename}")`);

// Setup the header and footer
fileStream.write(`const nLibrary = {\n`)
onDeath(() => {
  fileStream.write(`};\n\nmodule.exports.nLibrary = nLibrary;\n`);
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
    for (let input of inputs) {
      // each time there is a midi message call the onMIDIMessage function
      console.log(`${input.state}: "${input.name}"`);
      input.onmidimessage = (event)=> {
        // jzz silently ignores errors in callbacks, so we log them explicitly.
        try {
          if (event.data) analyzer.parser.parseArray(event.data);
        } catch (error) {
          console.error(error)
          throw error;
        }
      }
      input.onstatechange = (event)=> {
        /* Fires when MIDI devices plugged and unplugged */
      }
    }
    console.log(''); // newline
  }, (reason)=> {
    console.log('failed to get midi access:', reason);
  });
};
