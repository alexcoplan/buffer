
/**
 * @name buffer
 */

// constants
var oneHz = Math.PI*2;

// global vars
var clockCache = 0;
var frequency = 440;
var pulseCounter = new Counter(32);
var BPM = 120;
var beatFreq = BPM/60;
var delayUnit = new Delay(4,0.8,0);

function Counter(upto) { // counts from 0 -> upto - 1
  this.n = upto;
  this.i = 0;
}

Counter.prototype.count = function() {
  this.i = (this.i+1) % this.n;
  return this.i;
}

function Delay(division, mix, feedback) {
  this.numSamples = Math.round(sampleRate / (division*beatFreq*4));
  this.mix = mix;
  this.feedback = feedback;
  this.buffer = [];
  for (var i = 0; i < this.numSamples; i++) {
    this.buffer.push(0.0);
  }
}

Delay.prototype.process = function(sample) {
  var delay = this,
      delayed = delay.buffer.pop();
  delay.buffer.unshift(sample + delay.feedback*delayed);
  return sample + delay.mix*delayed;
}

/* to be called on every clock edge
 * rising => implies rising clock edge */
function tick(rising) {
  //frequency = (frequency === 440) ? 550 : 440;
  if (rising) pulseCounter.count(); // ticks every 1/32 beat
}

export function dsp(t) {
  var clock = Math.sin(16*beatFreq*oneHz*t) > 0; // ticks every 1/64 beat
  if (clock !== clockCache) tick(clock); // clock = 1 => rising clock edge
  clockCache = clock;
  
  var amplitude = 0;
  
  if (pulseCounter.i < 6) {
    amplitude = 1.0;
  }
  
  return delayUnit.process(amplitude * Math.sin(frequency*oneHz*t));
}
