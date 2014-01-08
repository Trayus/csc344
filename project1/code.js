
var wavdata;

function updateCanvas()
{
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	context.fillStyle = "#CCC";
	context.fillRect(0,0,500,200);
	
	context.strokeStyle = "#444";
	context.fillStyle = "#444";
	
	context.moveTo(15,5);
	context.lineTo(15,285);
	context.moveTo(5,100);
	context.lineTo(495,100);
	
	context.stroke();
	
	
	context.font="10px Georgia";
	context.fillText("A",2,12);
	context.fillText("t",3,112);
}
