
/**
 * @name buffer
 */

// constants
var oneHz = Math.PI*2;

// global vars
var notes = [440,550,660,880,770,660,550,440,330];
var clockCache = 0;
var frequency = 440;
var pulseCounter = new Counter(8);
var noteCounter = new Counter(notes.length);
var BPM = 120;
var beatFreq = BPM/60;
var delayUnit = new Delay(11128,.8,.6);

function Counter(upto) { // counts from 0 -> upto - 1
  this.n = upto;
  this.i = 0;
}

Counter.prototype.count = function() {
  this.i = (this.i+1) % this.n;
  return this.i;
}

function Delay(samples, mix, feedback) {
  this.numSamples = samples;
  this.mix = mix;
  this.feedback = feedback;
  this.counter = new Counter(samples);
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
 * rising => implies rising clock edge */
function tick(rising) {
  //frequency = (frequency === 440) ? 550 : 440;
  if (rising) {
    if (pulseCounter.count() === 0) noteCounter.count(); // ticks every 1/32 beat
  }
}

export function dsp(t) {
  var clock = Math.sin(16*beatFreq*oneHz*t) > 0; // ticks every 1/64 beat
  if (clock !== clockCache) tick(clock); // clock = 1 => rising clock edge
  clockCache = clock;
  
  var amplitude = 0;

  if (pulseCounter.i < 6) {
    amplitude = 0.3;
  }
  
  return delayUnit.process(amplitude * Math.sin(notes[noteCounter.i]*oneHz*t));
}
