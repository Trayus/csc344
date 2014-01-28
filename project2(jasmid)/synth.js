
function findInterpedOsc(t, spc)
{
	var ndx = (t % spc) / spc;
	var bf = -1;
	for (var i = 0; i < wave_pts.length - 1; i++)
	{
		if (ndx < wave_pts[i].x)
		{
			bf = i;
			break;
		}
	}
	if (bf == -1) return wave_pts[wave_pts.length - 1].y;
	else
	{
		var interp = (ndx - wave_pts[i].x) / (wave_pts[i + 1].x - wave_pts[i].x);
		return (1 - interp) * wave_pts[i].y + interp * wave_pts[i + 1].y;
	}
}

var ENV_LEN = 20000;

function Envelope(result, t, spc, fade)
{
	if (fade != -1 && t > ENV_LEN * env_pts[2].x)
	{
		// fade
		var interp = (fade - ENV_LEN * env_pts[3].x) / (ENV_LEN - ENV_LEN * env_pts[3].x);
		return ((1 - interp) * env_pts[3].y);
	}
	else if (t < ENV_LEN * env_pts[2].x)
	{
		if (t < ENV_LEN * env_pts[1].x)
		{
			var interp = t / (ENV_LEN * env_pts[1].x);
			return interp * env_pts[1].y;
		}
		else
		{
			var interp = (t - ENV_LEN * env_pts[1].x) / (ENV_LEN * env_pts[2].x - ENV_LEN * env_pts[1].x);
			return ((1 - interp) * env_pts[1].y + interp * env_pts[2].y);
		}
	}
	else
	{
		// sustain
		return env_pts[3].y;
	}
}

function applyLFO(result, t, sampleRate)
{
	var spc = sampleRate / LFOfreq; // global freq is LFO freq
	var ndx = (t % spc) / spc;
	
	return result * (1 + (amp / 100) * Math.sin(ndx));
}

/** awesome takes in the current GUI params set **/
function AwesomeGenerator (freq, vel)
{
	var self = {'alive': true};
	var spc = sampleRate / freq;
	var t = 0;
	var fading = -1;
	
	self.generate = function(buf, offset, count) {
		
		for (; count; count--) {
			var result = findInterpedOsc(t, spc);
			//console.log(Envelope(result, t, spc, fading));
			result *= Envelope(result, t, spc, fading);
			if (fading != -1 && fading > ENV_LEN)
				self.alive = false;
			else if (fading != -1)
				fading++;
			result = applyLFO(result, t, spc);
			result *= (vel / 128) * 0.15;
			buf[offset++] += result;
			buf[offset++] += result;
			t++;
		}
	}
	
	self.noteOff = function() {
		fading = 0;
	}
	
	return self;
}


function SineGenerator(freq) {
	var self = {'alive': true};
	var period = sampleRate / freq;
	var t = 0;
	
	self.generate = function(buf, offset, count) {
		for (; count; count--) {
			var phase = t / period;
			var result = Math.sin(phase * 2 * Math.PI) / 4;
			buf[offset++] += result;
			buf[offset++] += result;
			t++;
		}
	}
	
	self.noteOff = function() {
		self.alive = false;
	}
	
	return self;
}

function ADSRGenerator(child, attackAmplitude, sustainAmplitude, attackTimeS, decayTimeS, releaseTimeS) {
	var self = {'alive': true}
	var attackTime = sampleRate * attackTimeS;
	var decayTime = sampleRate * (attackTimeS + decayTimeS);
	var decayRate = (attackAmplitude - sustainAmplitude) / (decayTime - attackTime);
	var releaseTime = null; /* not known yet */
	var endTime = null; /* not known yet */
	var releaseRate = sustainAmplitude / (sampleRate * releaseTimeS);
	var t = 0;
	
	self.noteOff = function() {
		if (self.released) return;
		releaseTime = t;
		self.released = true;
		endTime = releaseTime + sampleRate * releaseTimeS;
	}
	
	self.generate = function(buf, offset, count) {
		if (!self.alive) return;
		var input = new Array(count * 2);
		for (var i = 0; i < count*2; i++) {
			input[i] = 0;
		}
		child.generate(input, 0, count);
		
		childOffset = 0;
		while(count) {
			if (releaseTime != null) {
				if (t < endTime) {
					/* release */
					while(count && t < endTime) {
						var ampl = sustainAmplitude - releaseRate * (t - releaseTime);
						buf[offset++] += input[childOffset++] * ampl;
						buf[offset++] += input[childOffset++] * ampl;
						t++;
						count--;
					}
				} else {
					/* dead */
					self.alive = false;
					return;
				}
			} else if (t < attackTime) {
				/* attack */
				while(count && t < attackTime) {
					var ampl = attackAmplitude * t / attackTime;
					buf[offset++] += input[childOffset++] * ampl;
					buf[offset++] += input[childOffset++] * ampl;
					t++;
					count--;
				}
			} else if (t < decayTime) {
				/* decay */
				while(count && t < decayTime) {
					var ampl = attackAmplitude - decayRate * (t - attackTime);
					buf[offset++] += input[childOffset++] * ampl;
					buf[offset++] += input[childOffset++] * ampl;
					t++;
					count--;
				}
			} else {
				/* sustain */
				while(count) {
					buf[offset++] += input[childOffset++] * sustainAmplitude;
					buf[offset++] += input[childOffset++] * sustainAmplitude;
					t++;
					count--;
				}
			}
		}
	}
	
	return self;
}

function midiToFrequency(note) {
	return 440 * Math.pow(2, (note-69)/12);
}

AwesomeProgram = {
	'createNote': function(note, velocity) {
		var frequency = midiToFrequency(note);
		return AwesomeGenerator(frequency, velocity);
	}
}

PianoProgram = {
	'attackAmplitude': 0.2,
	'sustainAmplitude': 0.1,
	'attackTime': 0.02,
	'decayTime': 0.3,
	'releaseTime': 0.02,
	'createNote': function(note, velocity) {
		var frequency = midiToFrequency(note);
		return ADSRGenerator(
			SineGenerator(frequency),
			this.attackAmplitude * (velocity / 128), this.sustainAmplitude * (velocity / 128),
			this.attackTime, this.decayTime, this.releaseTime
		);
	}
}

StringProgram = {
	'createNote': function(note, velocity) {
		var frequency = midiToFrequency(note);
		return ADSRGenerator(
			SineGenerator(frequency),
			0.5 * (velocity / 128), 0.2 * (velocity / 128),
			0.4, 0.8, 0.4
		);
	}
}

PROGRAMS = {
	41: StringProgram,
	42: StringProgram,
	43: StringProgram,
	44: StringProgram,
	45: StringProgram,
	46: StringProgram,
	47: StringProgram,
	49: StringProgram,
	50: StringProgram
};

function Synth(sampleRate) {
	
	var generators = [];
	
	function addGenerator(generator) {
		generators.push(generator);
	}
	
	function generate(samples) {
		var data = new Array(samples*2);
		generateIntoBuffer(samples, data, 0);
		return data;
	}
	
	function generateIntoBuffer(samplesToGenerate, buffer, offset) {
		for (var i = offset; i < offset + samplesToGenerate * 2; i++) {
			buffer[i] = 0;
		}
		for (var i = generators.length - 1; i >= 0; i--) {
			generators[i].generate(buffer, offset, samplesToGenerate);
			if (!generators[i].alive) generators.splice(i, 1);
		}
	}
	
	return {
		'sampleRate': sampleRate,
		'addGenerator': addGenerator,
		'generate': generate,
		'generateIntoBuffer': generateIntoBuffer
	}
}
