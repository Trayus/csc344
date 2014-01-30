var vec2 = function(x, y)
{
    this.x = x;
	this.y = y;
}
wave_pts = [new vec2(0, 0), new vec2(0.15, 0.5), new vec2(0.3, 1), 
	new vec2(0.4, 1), new vec2(0.48, 1), new vec2(0.5, 0), new vec2(0.52, -1), 
	new vec2(0.6, -1), new vec2(0.7, -1), new vec2(0.85, -0.5), new vec2(1, 0)];
env_pts = [new vec2(0, 0), new vec2(0.2, 1), new vec2(0.4, 0.5), 
	new vec2(0.8, 0.5), new vec2(1, 0)];
LFOfreq = 3;
amp = 5;
	
/** Randomizes the points of the envelope and the wave,
    as well as the LFO frequency and amplitude
**/	
function randomize()
{
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		wave_pts[i].x = Math.random() * (0.25 - i * 0.02) + wave_pts[i - 1].x;
		if (wave_pts[i].x > 1) wave_pts[i].x = 1;
		wave_pts[i].y = Math.random() * 2 - 1;
	}
	var lowest = 1, highest = -1, hi = 0, li = 0;
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		if (wave_pts[i].y > highest)
		{ highest = wave_pts[i].y; hi = i; }
		if (wave_pts[i].y < lowest)
		{ lowest = wave_pts[i].y; li = i; }
	}
	wave_pts[hi].y = 1;
	wave_pts[li].y = -1;
	
	env_pts[2].y = Math.sqrt(Math.random());
	env_pts[3].y = env_pts[2].y;
	env_pts[1].x = Math.random() * 0.2;
	env_pts[2].x = Math.random() * 0.3 + env_pts[1].x;
	env_pts[3].x = Math.random() * 0.1 + 0.9;
	
	var f = document.getElementById("freq");
	LFOfreq = Math.floor(Math.random() * 8);
	f.innerHTML = "Sine-wave LFO Freq = " + LFOfreq + " Hz";
	
	var a = document.getElementById("amp");
	amp = Math.floor(Math.random() * 12) + 3;
	a.innerHTML = "Sine-wave LFO Amplitude = " + amp + "%";
	
	clearCanvases();
}

/** also randomizes all input, but ensures 
    that the first half of the waveform is > 0 and
	the second half is < 0
**/
function randomize2()
{
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		wave_pts[i].x = Math.random() * (0.25 - i * 0.02) + wave_pts[i - 1].x;
		if (wave_pts[i].x > 1) wave_pts[i].x = 1;
		if (i < wave_pts.length / 2)
			wave_pts[i].y = Math.random();
		else
			wave_pts[i].y = Math.random() * -1;
		if (Math.abs(wave_pts[i].y - wave_pts[i - 1].y) > 0.8)
			wave_pts[i].y /= 4;
	}
	var lowest = 1, highest = -1, hi = 0, li = 0;
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		if (wave_pts[i].y > highest)
		{ highest = wave_pts[i].y; hi = i; }
		if (wave_pts[i].y < lowest)
		{ lowest = wave_pts[i].y; li = i; }
	}
	wave_pts[hi].y = 1;
	wave_pts[li].y = -1;
	
	env_pts[2].y = Math.sqrt(Math.random());
	env_pts[3].y = env_pts[2].y;
	env_pts[1].x = Math.random() * 0.2;
	env_pts[2].x = Math.random() * 0.3 + env_pts[1].x;
	env_pts[3].x = Math.random() * 0.4 + 0.6;
	
	var f = document.getElementById("freq");
	LFOfreq = Math.floor(Math.random() * 8);
	f.innerHTML = "Sine-wave LFO Freq = " + LFOfreq + " Hz";
	
	var a = document.getElementById("amp");
	amp = Math.floor(Math.random() * 12) + 3;
	a.innerHTML = "Sine-wave LFO Amplitude = " + amp + "%";
	
	clearCanvases();
}

function clearCanvases()
{
	updateCanvas("wave");
	updateCanvas("env");
}

/** canvas x and y for drawing input **/
function getCx(vec)
{
	return vec.x * 400 + 5;
}
function getCy(vec)
{
	return vec.y * -90 + 100;
}


/** draws the UI **/
function updateCanvas(name)
{
	var canvas = document.getElementById(name);
	var context = canvas.getContext("2d");
		
	context.strokeStyle = "#ACC";
	context.fillStyle = "#ACC";
	context.fillRect(0,0,410,200);
	
	context.stroke();
	
	context.beginPath();
	context.strokeStyle = "#444";
	context.moveTo(5,5);
	context.lineTo(5, name == "env"? 100 : 195);
	context.moveTo(5,100);
	context.lineTo(405,100);
	context.stroke();
	context.closePath();
	
	if (name == "wave")
	{
		context.beginPath();
		context.strokeStyle = "#22F";
		context.moveTo(getCx(wave_pts[0]), getCy(wave_pts[0])); 
		console.log(wave_pts);
		for (var i = 1; i < wave_pts.length; i++)
		{
			context.lineTo(getCx(wave_pts[i]), getCy(wave_pts[i])); 
		}
		context.stroke();
		context.closePath();
	}
	else
	{
		context.beginPath();
		context.strokeStyle = "#292";
		context.moveTo(getCx(env_pts[0]), getCy(env_pts[0])); 
		console.log(env_pts);
		for (var i = 1; i < env_pts.length; i++)
		{
			context.lineTo(getCx(env_pts[i]), getCy(env_pts[i])); 
		}
		context.stroke();
		context.closePath();
	}
}