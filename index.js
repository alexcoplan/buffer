
/**
 * @name buffer
 */

// constants
var oneHz = Math.PI*2;

// general paremeters
var clockDivisions = 16; // ticks per beat
var pulseFreq = 1;
var BPM = 120;
var notes = [440,525,660,880,770,660,525,495, 330, 385];
var oscillatorAmplitude = 0.4;
var noteDuration = 0.375; // duration of pulses, in beats

// delay parameters
var delayMix = 1.0;
var delayFeedback = 0.6;
var beatsToDelay = 0.5;

// global vars
var clockCache = 0;
var frequency = 440;
var pulseCounter = new Counter(pulseFreq * clockDivisions);
var noteCounter = new Counter(notes.length);
var beatFreq = BPM/60;
var delayUnit = new Delay(beatsToDelay,delayMix,delayFeedback);
var amplitude = 0;

function increaseTo(source, interval, target) {
  if (source + interval >= target) return target;
  return source + interval;
}

function decreaseTo(source, interval, target) {
  if (source - interval <= target) return target;
  return source - interval;
}

function Counter(upto) { // counts from 0 -> upto - 1
  this.n = upto;
  this.i = 0;
}

Counter.prototype.count = function() {
  this.i = (this.i+1) % this.n;
  return this.i;
}

Counter.prototype.plus = function(x) {
  return (this.i + x) % this.n;
}

function Delay(beatsDelay, mix, feedback) {
  this.numSamples = Math.round(beatsDelay * sampleRate/beatFreq);
  this.mix = mix;
  this.feedback = feedback;
  this.counter = new Counter(this.numSamples);
  this.buffer = [];
  for (var i = 0; i < this.numSamples; i++) {
    this.buffer.push(0.0);
  }
}

Delay.prototype.process = function(sample) {
  var writeTo = this.counter.i,
      delay = this,
      delayed = delay.buffer[this.counter.count()];
  delay.buffer[writeTo] = sample + delay.feedback*delayed;
  return sample + delay.mix*delayed;
}

/* to be called on every clock edge
 * rising => rising clock edge */
function tick(rising) {
  if (rising) {
    // this code is executed clockDivision times per beat
    if (pulseCounter.count() === 0) noteCounter.count();
  }
}

export function dsp(t) {
  var clock = Math.sin(clockDivisions*beatFreq*oneHz*t) > 0;
  if (clock !== clockCache) tick(clock); // ticks 2*clockDivisions every beat
  clockCache = clock;
  
  // each pulse should have a linear envelope
  // which attacks for 0.5*smoothing samples
  // and decays for smoothing samples
  var smoothing = 250.0,
      smoothingInterval = oscillatorAmplitude/smoothing;

  if (pulseCounter.i < Math.round(noteDuration * clockDivisions)) {
    amplitude = increaseTo(amplitude, smoothingInterval*2, oscillatorAmplitude);
  }
  else {
    amplitude = decreaseTo(amplitude, smoothingInterval, 0);
  }
  
  var signal = amplitude * (0.4 * Math.sin(0.5*notes[noteCounter.i]*oneHz*t)
                          + 0.6 * Math.sin(notes[noteCounter.plus(4)]*oneHz*t));
  
  return delayUnit.process(signal);
}
