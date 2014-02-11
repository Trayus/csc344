function applyVolume(data)
{
	for (i = 0; i < data.length; i++)
		data[i] *= globalVolume;
	return data;
}

var delay_len = 50000;
var previous_samples = new Array();
for (var i = 0; i < delay_len; i++)
    previous_samples[i] = 0;
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
function applyDelay(data)
{
	var newdata = new Array();
	for (var i = 0; i < data.length; i++)
	{
		newdata[i] = 0.8 * data[i] + 
			0.6 * ((i < 8000)?
				previous_samples[delay_len - 8000 + i] :
				data[i - 8000]) + 
			0.4 * ((i < 16000)?
				previous_samples[delay_len - 16000 + i] :
				data[i - 16000]) + 
			0.2 * ((i < 24000)?
				previous_samples[delay_len - 24000 + i] :
				data[i - 24000]);
	}
	shiftIn(data);
	return newdata;
}

var prev_sample_1 = 0;
var prev_sample_2 = 0;
function applyLowPass(data)
{
	var temp1 = data[data.length - 1];
	var temp2 = data[data.length - 2];

	var val = 3.1415926 * (zeroFreq / 10000);
	//var gain = 2 + 2 * Math.cos(val);
	
	for (i = data.length - 1; i > 2; i--)
		data[i] = data[i] - 2 * Math.cos(val) * data[i - 1] + data[i - 2];

	data[0] = data[0] - 2 * Math.cos(val) * prev_sample_1 + prev_sample_2;
	data[1] = data[1] - 2 * Math.cos(val) * data[0] + prev_sample_1;
	
	prev_sample_1 = temp1;
	prev_sample_2 = temp2;
	
	/*for (i = 0; i < data.length; i++)
		data[i] = data[i] * gain;
*/
	return data;
}