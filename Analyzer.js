import help from 'midi-help';
import s11 from 'sharp11';


export class ChordAnalyzer {
  constructor() {

    // s11 does not include a way to lookup notes by their midi note number.
    // I'll make that possible here via the midiNotes object, which indexes beginning at 24
    const s11NotesByMidi = {}
    const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(octave){
      notes.forEach((noteName) => {
        const note = s11.note.create(noteName, octave);
        s11NotesByMidi[note.value()] = note;
      });
    });

    this.parser = new help.MidiParser();
    this.midiNotesDown = {};
    this.lastChord = { s11Notes: [], name: '' };

    this.parser.on('noteOn', (note, velocity, channel) =>{
      if (velocity === 0) {
        console.log('converting noteOn with v=0 to noteOff');
        parser.emit('noteOff', note, velocity, channel);
        return;
      }

      this.midiNotesDown[note] = {
        midi: [note, velocity, channel],
        s11: s11NotesByMidi[note],
      };

      const noteNames = Object.entries(this.midiNotesDown).map(v => v[1].s11.fullName);
      const down      = Object.entries(this.midiNotesDown).map(v => v[1].s11);
      const chordName = s11.chord.identifyArray(down);
      // Object.entries(undefined); console.log('after hi');
      //midiNotesDosdfs[note] = {a: 'hi'}; console.log('after');

      this.lastChord.s11Notes = down;
      this.lastChord.name = chordName;

      this.parser.emit('chord', this.lastChord);
    });
    
    this.parser.on('noteOff', (note, velocity, channel) => {
      if (this.midiNotesDown[note]) delete this.midiNotesDown[note];
      if (Object.keys(this.midiNotesDown).length === 0) this.parser.emit('lastChord', this.lastChord);
    });
    
    this.parser.on('lastChord', (chord) => {
      console.log('lastChord:', chord.name);
    });
    
    this.parser.on('chord', (chord) => {
      console.log('Chord:', chord.name);
    });
  }
}