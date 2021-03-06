var vec2 = function(x, y)
{
    this.x = x;
	this.y = y;
}
wave_pts = [new vec2(0, 0), new vec2(0.15, 0.5), new vec2(0.3, 1), new vec2(0.5, 0), 
	new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0),
	new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0),
	new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0), new vec2(0.5, 0), 
	new vec2(0.5, 0), new vec2(0.7, -1), new vec2(0.85, -0.5), new vec2(1, 0)];
env_pts = [new vec2(0, 0), new vec2(0.2, 1), new vec2(0.4, 0.5), 
	new vec2(0.8, 0.5), new vec2(1, 0)];
LFOfreq = 3;
amp = 5;
var smoothness = 0.5;
var globalVolume = 1;
var zeroFreq = 2000;
	
function updateSmoothness()
{
	var sm = document.getElementById("smo");
	smoothness = parseInt(sm.value) / 100;
	if (isNaN(smoothness) || smoothness < 0)
	{
		sm.value = "0";
		smoothness = 0;
	}
	else if (smoothness > 1)
	{
		sm.value = "100";
		smoothness = 1;
	}
}	
function updateLowPass()
{
	var lp = document.getElementById("lowpass");
	zeroFreq = Math.floor(parseInt(lp.value));
	if (isNaN(zeroFreq) || zeroFreq < 10)
	{
		lp.value = "2000";
		zeroFreq = 2000;
	}
	else if (zeroFreq > 10000)
	{
		lp.value = "10000";
		zeroFreq = 10000;
	}
}	

/** defines a 2D region on a 2D axis set. Can produce random numbers
    within that region **/
function Region(x1, x2, y1, y2)
{
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	
	this.Xvalue = function()
	{
		return Math.random() * (x2 - x1) + x1;
	}
	
	this.Yvalue = function()
	{
		return Math.random() * (y2 - y1) + y1;
	}
}	
	
/** Randomizes the points of the envelope and the wave,
    as well as the LFO frequency and amplitude
**/	
function randomize()
{
	var regionA = new Region(0.01 + (0.23 * smoothness), 0.49 - (0.23 * smoothness), 1, -0.5 + (1.45 * smoothness));
	var regionB = new Region(0.51 + (0.23 * smoothness), 0.99 - (0.23 * smoothness), 0.5 - (1.45 * smoothness), -1);
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		if (i < wave_pts.length / 2)
		{
			wave_pts[i].x = regionA.Xvalue();
			wave_pts[i].y = regionA.Yvalue();
		}
		else 
		{
			wave_pts[i].x = regionB.Xvalue();
			wave_pts[i].y = regionB.Yvalue();		
		}
	}
	/** now sort the points based on x **/
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		for (var j = i + 1; j < wave_pts.length - 1; j++)
		{
			if (wave_pts[i].x > wave_pts[j].x)
			{
				var temp = wave_pts[i].x;
				wave_pts[i].x = wave_pts[j].x;
				wave_pts[j].x = temp;
			}
		}
	}
	/** ensure sufficient space **/
	for (var i = 1; i < wave_pts.length - 1; i++)
	{
		if (wave_pts[i].x + 0.02 > wave_pts[i+1].x)
		{
			wave_pts[i+1].x += 0.02;
		}
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
	
	env_pts[1].y = 1;
	env_pts[2].y = Math.random() * 0.4 + 0.3;
	env_pts[3].y = env_pts[2].y;
	env_pts[1].x = Math.random() * 0.25;
	env_pts[2].x = Math.random() * 0.3 + env_pts[1].x;
	env_pts[3].x = Math.random() * 0.4 + 0.6;
	
	var f = document.getElementById("freq");
	LFOfreq = Math.floor(Math.random() * 5) + 2;
	f.innerHTML = "Sine-wave LFO Freq = " + LFOfreq + " Hz";
	
	var a = document.getElementById("amp");
	amp = Math.floor(Math.random() * 4) + 1;
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