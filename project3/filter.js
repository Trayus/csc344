
/** a simple volume-control filter **/
function applyVolume(data)
{
	for (i = 0; i < data.length; i++)
		data[i] *= globalVolume;
	return data;
}

var delay_len = 50000;
var previous_samples = new Array();
/** initialize the delay buffer **/
for (var i = 0; i < delay_len; i++)
    previous_samples[i] = 0;
/** helper function to store audio data in the delay buffer **/
function shiftIn(data)
{
	if (delay_len - data.length > 0)
	{
		for (var i = 0; i < delay_len - data.length; i++)
		{
			previous_samples[i] = previous_samples[i + data.length];
		}
		var j = 0;
		for (var i = delay_len - data.length; i < delay_len; i++)
		{
			previous_samples[i] = data[j++];
		}
	}
	else
	{
		var j = data.length - delay_len;
		for (var i = 0; i < delay_len; i++)
		{
			previous_samples[i] = data[j++];
		}
	}
}
/** A delay filer; using the delay buffer, makes the audio sound like 
    it recurs three times (uses a lot of input from the GUI) **/ 
function applyDelay(data)
{
	var newdata = new Array();
	for (var i = 0; i < data.length; i++)
	{
		newdata[i] = data[i] + 
			d1a * ((i < d1)?
				previous_samples[delay_len - d1 + i] :
				data[i - d1]) + 
			d2a * ((i < d2)?
				previous_samples[delay_len - d2 + i] :
				data[i - d2]) + 
			d3a * ((i < d3)?
				previous_samples[delay_len - d3 + i] :
				data[i - d3]);
	}
	shiftIn(data);
	return newdata;
}

/** a distorsion filter: caps the max amplitude, then applies a gain **/
function applyCrush(data)
{
	for (var i = 0; i < data.length; i++)
	{
		if (data[i] > crush)
			data[i] = crush;
		data[i] *= (1 / (Math.sqrt(crush)));
	}
	return data;
}

var ampmodt = 0;
/** an amplitude modulation filter, with frequency that can be set in the GUI **/
function applyAmpMod(data)
{	
	for (var i = 0; i < data.length; i++)
	{
		var phase = ampmodt / sampleRate * 2 * Math.PI;
	
	    data[i] *= (0.5 * Math.sin(ampmodfreq * phase) + 1);
	
		ampmodt++;
	}
	return data;
}