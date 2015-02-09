
/**
 * @name buffer
 */

// constants
var oneHz = Math.PI*2;

// global vars
var clockCache = 0;
var frequency = 440;
var pulseCounter = new Counter(8);

function Counter(upto) { // counts from 0 -> upto - 1
  this.n = upto;
  this.i = 0;
}

Counter.prototype.count = function() {
  this.i = (this.i+1) % this.n;
  return this.i;
}

/* to be called on every clock edge
 * rising => implies rising clock edge */
function tick(rising) {
  //frequency = (frequency === 440) ? 550 : 440;
  pulseCounter.count();
}

export function dsp(t) {
  var clock = Math.sin(4*oneHz*t) > 0; // 1Hz clock
  if (clock !== clockCache) tick(clock === 1); // clock = 1 => rising clock edge
  clockCache = clock;
  
  var amplitude = 0;
  
  if (pulseCounter.i === 0) {
    amplitude = 1;
  }
  
  return amplitude * Math.sin(frequency*oneHz*t);
}
