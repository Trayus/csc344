var context = new window.webkitAudioContext();
var wavdataL = new Array();
var wavdataR = new Array();
var length = 0, start = 0, segments = 1;

function updateSegments()
{
	var text = document.getElementById("segments").value;
	var num = parseFloat(text);
	
	if (num != 'undefined' && !isNaN(num) && num > 0)
		segments = num;
		
	console.log("segments set to " + segments);
}

function randomizeSegments()
{
	var newLbuf = new Array();
	var newRbuf = new Array();
	
	// indicating how many segments there are to choose from
	var numsegs = Math.floor(wavdataL.length / length);
	
	console.log(numsegs + " segments to choose from, generating piece with " + segments + " segments");
	for (var i = 0; i < segments; i++)
	{
		var begin = start + Math.floor(Math.random() * numsegs) * length;
		
		for (var j = 0; j < length; j++)
		{
			newLbuf[newLbuf.length] = wavdataL[begin + j];
			newRbuf[newRbuf.length] = wavdataR[begin + j];
		}
	}
	
	wavdataL = newLbuf;
	wavdataR = newRbuf;
	
	updateCanvas();
}

function reverse()
{
	var newLbuf = new Array();
	var newRbuf = new Array();
	
	for (var j = 0; j < wavdataL.length; j++)
	{
		newLbuf[newLbuf.length] = wavdataL[wavdataL.length - 1 - j];
		newRbuf[newRbuf.length] = wavdataR[wavdataR.length - 1 - j];
	}
	
	wavdataL = newLbuf;
	wavdataR = newRbuf;
	
	updateCanvas();
}

function updateStart()
{
	var text = document.getElementById("start").value;
	var num = parseFloat(text);
	
	if (num != 'undefined' && !isNaN(num))
		start = num;
	
	updateCanvas();
}

function updateLength()
{
	var text = document.getElementById("length").value;
	var num = parseFloat(text);
	
	if (num != 'undefined' && !isNaN(num))
		length = num;
	
	updateCanvas();
}

function clickLength(event)
{
	if (event.pageX > 20 && event.pageX < 500)
	{
		length = (event.pageX - 20) * 100;
		document.getElementById("length").value = length;
		updateCanvas();
	}
}


function loadListeners()
{	
	console.log("Loading listeners");
	document.getElementById('canvas').addEventListener('mousedown', function(event) {	clickLength(event); });
	
	var fileInput = document.querySelector('input[type="file"]');
	fileInput.addEventListener('change', function(e) {

		console.log("Preparing to read file");
	
	   var reader = new FileReader();

	   reader.onload = function(e) {
		  initSound(this.result);
	   };

	   reader.readAsArrayBuffer(this.files[0]);

	}, false);
}

function popSine()
{
	wavdataL = new Array();
	wavdataR = new Array();
	for (var i = 0; i < 48000; i++)
	{
		wavdataL[i] = Math.sin(3.1415926 * 2 * 32.7 * 2 * (i / 44100)); // low C note
		wavdataR[i] = Math.sin(3.1415926 * 2 * 49.0 * 4 * (i / 44100)); // medium G note
	}
	updateCanvas();	
}

var left = true;
function setleft(bool)
{
	left = bool;
	updateCanvas();
}

function updateCanvas()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	/* fix below because canvas was being a nuisance and not clearing */
	//context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = 0;
	canvas.height = 0;
	canvas.width = 500;
	canvas.height = 200;
	
	context.strokeStyle = "#DCC";
	context.fillStyle = "#DCC";
	context.fillRect(0,0,500,200);
	
	context.stroke();
	
	context.strokeStyle = "#444";
	context.fillStyle = "#444";
	
	context.moveTo(15,5);
	context.lineTo(15,195);
	context.moveTo(5,100);
	context.lineTo(495,100);
	
	context.stroke();
	
	context.font="10px Georgia";
	context.fillText("A",2,12);
	context.fillText("1",7,22);
	context.fillText("-1",2,188);
	context.fillText("t",3,112);
	context.fillText("0",7,97);
	context.fillText("48000",470,97);
	
	context.fillStyle = 'rgba(250,50,50,0.2)';
	context.fillRect(15,5,480 * length / 48000, 190);
	
	if (left)
	{
		context.strokeStyle = 'rgba(50,150,50,0.5)';
		context.fillStyle = 'rgba(50,150,50,0.5)';
		
		context.moveTo(15,100);
		for (var i = start; i < 48000 + start && i < wavdataL.length; i+=10)
		{
			context.lineTo(15 + 480 * (i - start) / 48000, 100 + 95 * wavdataL[i]);
		}
		context.stroke();
	}
	else
	{
		context.strokeStyle = 'rgba(50,50,250,0.5)';
		context.fillStyle = 'rgba(50,50,250,0.5)';
		
		context.moveTo(15,100);
		for (var i = start; i < 48000 + start && i < wavdataR.length; i+=10)
		{
			context.lineTo(15 + 480 * (i - start) / 48000, 100 + 95 * wavdataR[i]);
		}
		context.stroke();
	}
}




var savePiece = function(rev)
{
	if (wavdataL.length == 0 || wavdataR.length == 0)
	{
		console.log("nothing to save");
		return;
	}

	var date = new Date();
	var name = (date.getDate()) + "-" + (date.getMonth() + 1) + "-" + (date.getFullYear()) + "--" + 
		(date.getHours()) + "-" + (date.getMinutes()) + "-" + (date.getSeconds()) + ".wav";
	
	if (!rev)
	{
		var data = encodePiece();
		saveAs(new Blob([data], {type:'audio/wav'}), name);
	}
	else
	{
		var data = encodePieceRev();
		saveAs(new Blob([data], {type:'audio/wav'}), name);
	}
}

var encodePiece = function()
{
	var num = wavdataL.length + wavdataR.length;
	var samples = new Array();
	
	/* interleave left and right channels */
	for (var i = 0; i < num; i++)
	{
		samples[i * 2] = wavdataL[i];
		samples[i * 2 + 1] = wavdataR[i];
	}

	var wav = encodeWAV(samples);
	return wav;
}

var encodePieceRev = function()
{
	var num = wavdataL.length + wavdataR.length;
	var samples = new Array();
	
	/* interleave left and right channels */
	for (var i = 0; i < num; i++)
	{
		samples[i * 2] = wavdataL[wavdataL.length - 1- i];
		samples[i * 2 + 1] = wavdataR[wavdataR.length - 1 - i];
	}

	var wav = encodeWAV(samples);
	return wav;
}

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, 44100, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, 44100 * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}


function readString(view, offset, len){
  var string = "";
  for (var i = 0; i < len; i++){
    var chr = view.getUint8(offset + i);
	string += String.fromCharCode(chr);
  }
  return string;
}


function initSound(arrayBuffer) {
   audioArrayBuffer = arrayBuffer;

   console.log("yes");
   
   context.decodeAudioData(arrayBuffer, function(buffer) {

     // here's where I put my stuff mapping the buffer to my own arrays;
	 wavdataL = buffer.getChannelData(0);
	 wavdataR = buffer.getChannelData(1);
	 updateCanvas();

   }, function(err) {
      console.log('Error decoding file', err);
   });
}