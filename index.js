
/**
 * @name buffer
 */

// constants
var oneHz = Math.PI*2;

// global vars
var clockCache = 0;
var frequency = 440;

/* to be called on every clock edge
 * rising => implies rising clock edge */
function tick(rising) {
  frequency = (frequency === 440) ? 550 : 440;
}

export function dsp(t) {
  var clock = Math.sin(oneHz*t) > 0; // 1Hz clock
  if (clock !== clockCache) tick(clock === 1); // clock = 1 => rising clock edge
  clockCache = clock;
  
  return Math.sin(frequency*oneHz*t);
}
