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
var ampmodfreq = 40;
var d1 = 10000, d2 = 20000, d3 = 40000;	
var d1a = 0.3, d2a = 0.5, d3a = 0.2;	
var crush = 0.9;


/** these are functions to get and validate input from the web page **/	
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
function updateAmpMod()
{
	var am = document.getElementById("ampmod");
	ampmodfreq = parseFloat(am.value);
	if (isNaN(ampmodfreq) || ampmodfreq < 10)
	{
		am.value = "10";
		ampmodfreq = 10;
	}
	else if (ampmodfreq > 1000)
	{
		am.value = "1000";
		ampmodfreq = 1000;
	}
}	
function updateCrush() {
	var c = document.getElementById("crush");
	crush = parseFloat(c.value);
	if (isNaN(crush) || crush < 0.05) {
		c.value = "0.05";
		crush = 0.05;
	} else if (crush > 1) {
		c.value = "1";
		crush = 1;
	}
}
function updateD1() {
	var d = document.getElementById("d1");
	d1 = Math.floor(parseInt(d.value));
	if (isNaN(d1) || d1 < 10) {
		d.value = "10";
		d1 = 10;
	} else if (d1 > 50000) {
		d.value = "5000";
		d1 = 50000;
	}
}
function updateD1A() {
	var d = document.getElementById("d1a");
	d1a = parseFloat(d.value);
	if (isNaN(d1a) || d1a < 0) {
		d.value = "0";
		d1a = 0;
	} else if (d1a > 3) {
		d.value = "3";
		d1a = 3;
	}
}
function updateD2() {
	var d = document.getElementById("d2");
	d2 = Math.floor(parseInt(d.value));
	if (isNaN(d2) || d2 < 10) {
		d.value = "10";
		d2 = 10;
	} else if (d2 > 50000) {
		d.value = "5000";
		d2 = 50000;
	}
}
function updateD2A() {
	var d = document.getElementById("d2a");
	d2a = parseFloat(d.value);
	if (isNaN(d2a) || d2a < 0) {
		d.value = "0";
		d2a = 0;
	} else if (d2a > 3) {
		d.value = "3";
		d2a = 3;
	}
}
function updateD3() {
	var d = document.getElementById("d3");
	d3 = Math.floor(parseInt(d.value));
	if (isNaN(d3) || d3 < 10) {
		d.value = "10";
		d3 = 10;
	} else if (d3 > 50000) {
		d.value = "5000";
		d3 = 50000;
	}
}
function updateD3A() {
	var d = document.getElementById("d3a");
	d3a = parseFloat(d.value);
	if (isNaN(d3a) || d3a < 0) {
		d.value = "0";
		d3a = 0;
	} else if (d3a > 3) {
		d.value = "3";
		d3a = 3;
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
    as well as the LFO frequency and amplitude, and all filter inputs
**/	
function randomizeAll()
{
	randomize();
	
	ampmodfreq = Math.floor(Math.random() * 900 + 20);
	document.getElementById("ampmod").value = ampmodfreq;
	crush = Math.random() * 0.8 + 0.03;
	document.getElementById("crush").value = crush.toFixed(3);
	d1a = Math.random() * 1.5 + 0.1;
	document.getElementById("d1a").value = d1a.toFixed(3);
	d2a = Math.random() * 1.5 + 0.1;
	document.getElementById("d2a").value = d2a.toFixed(3);
	d3a = Math.random() * 1.5 + 0.1;
	document.getElementById("d3a").value = d3a.toFixed(3);
	d1 = Math.floor(Math.random() * 5000) + 3000;
	document.getElementById("d1").value = d1;
	d2 = Math.floor(Math.random() * 5000) + 9000;
	document.getElementById("d2").value = d2;
	d3 = Math.floor(Math.random() * 5000) + 15000;
	document.getElementById("d3").value = d3;
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