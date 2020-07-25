const navigator = require('jzz');
const ChordAnalyzer = require('./Analyzer.js');

const analyzer = new ChordAnalyzer(process.stdout);

// Annoying Midi Boilerplate
if (!navigator.requestMIDIAccess) {
  console.log("MIDI is not supported in your environment");
} else { navigator.requestMIDIAccess({
    sysex: false // this defaults to 'false' in the browser
  }).then(function(midiAccess){
    const inputs = midiAccess.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      // each time there is a midi message call the onMIDIMessage function
      input.value.onmidimessage = function(event){
        // jzz silently ignores errors in callbacks, so we log them explicitly.
        try {
          if (event.data) analyzer.parser.parseArray(event.data);
        } catch (error) {
          console.error(error)
          throw error;
        }
      }
      input.value.onstatechange = function(event) {
        console.log('// Midi state changed (ex. device (dis)connected)');
      }
    }
  }, function(reason){console.log('failed to get midi access:', reason)});
};
