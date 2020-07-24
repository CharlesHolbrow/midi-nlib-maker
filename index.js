const navigator = require('jzz');
const ChordAnalyzer = require('./Analyzer.js');

const analyzer = new ChordAnalyzer();

// Annoying Midi Boilerplate
if (!navigator.requestMIDIAccess) {
  console.log("MIDI is not supported in your environment");
} else { navigator.requestMIDIAccess({
    sysex: false // this defaults to 'false'
  }).then(function(midiAccess){
    const inputs = midiAccess.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      // each time there is a midi message call the onMIDIMessage function
      console.log(Object.keys(input.value));
      input.value.onmidimessage = function(event){
        // jzz silently ignore errors in callbacks Log them explicitly.
        try {
          if (event.data) analyzer.parser.parseArray(event.data);
        } catch (error) {
          console.error(error)
        }
      }
      input.value.onstatechange = function(event) {
        console.log('input.value.onstatechange:', arguments);
      }
    }
  }, function(reason){console.log('failed to get midi access:', reason)});
};
