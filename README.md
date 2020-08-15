# Deprecated

This behavior has been moved to the [@fluid-music/utils](https://www.npmjs.com/package/@fluid-music/utils) package.

# make-nlib

A super simple way to create nLibraries containing chords with a MIDI keyboard.

```
$ npm install -g @fluid-music/make-nlib
$ make-nlib output.js
Usage: $ make-nlib out.js # (Currently writing to "output.js")
connected: "Midi Through Port-0"
connected: "MPK Mini Mk II MIDI 1"
```

Now play some chords on any connected midi device to generate a file like the one below (use `ctrl+c` to stop recording).

```javascript
const nLibrary = {
  "a": {
    type: "midiChord",
    name: "Cm",
    notes: [ 60, 63, 67 ],
  },
  "b": {
    type: "midiChord",
    name: "Ab",
    notes: [ 56, 60, 63 ],
  },
  "c": {
    type: "midiChord",
    name: "Bb",
    notes: [ 58, 62, 65 ],
  },
};

module.exports.nLibrary = nLibrary;
```


