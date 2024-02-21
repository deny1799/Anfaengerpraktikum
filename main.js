import { Point } from "./Point.js";
import { PolygonExamples } from './PolygonExamples.js';
import {BilliardsBall} from "./BilliardsBall.js";
import { BilliardsBalls } from "./BilliardsBalls.js";
import { myChart } from "./myChart.js";
import { Trajectories } from "./Trajectories.js";

const canvas = document.getElementById("billiardscanvas");
const ctx = canvas.getContext("2d");
const chartctx = document.getElementById("scatterchart").getContext("2d");

document.getElementById("start").addEventListener("click", runit);
//document.getElementById("stop").addEventListener("click", stopit);

document.getElementById("polygontype").addEventListener("change", changePolygonType);
document.getElementById("vertices").addEventListener("change", chooseVertices);
document.getElementById("numballs").addEventListener("change", chooseNumBalls);
document.getElementById("trajectories").addEventListener("change", chooseNumTrajectories);
document.getElementById("startangle").addEventListener("change", chooseStartAngle);
document.getElementById("batchmode").addEventListener("click", checkBatchMode);
document.getElementById("symplecticmode").addEventListener("click", checkSymplecticMode);


let timerMilliseconds = 10;
let numVertices = Number(document.getElementById("vertices").value);
let numBalls = Number(document.getElementById("numballs").value);
let trajectoryDepth = Number(document.getElementById("trajectories").value);
let startAngle = Number(document.getElementById("startangle").value);
let batchMode = false; //document.getElementById("batchmode");
let batchDataPoints = 1000;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let useSymplectic = true;

var polygon = [];

let ballRadius = 5; // Radius des Balls

let billiardsBall; // this is the most important object !!!
// let ballcolor = "#0095DD";
const ballColors = ['#0095DD', '#000000', '#00ff00', '#ff0000', '#c0c0c0', 
				    '#000080', '#008000', '#ff00ff', '#808080', '#800000'];
// let backcolor = "#FF0000";

let interval_ID = null;

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");



slider.oninput = function drawspeed()
{
    distance = Number(slider.value);
    output.innerHTML = slider.value;
}

function choosePolygonType(typ, numvertices)
{
	switch(typ)
	{
		case "regular": return PolygonExamples.RegularPolygon(0.9, numvertices, 10, 10, 300, 300); 
		case "convex": return PolygonExamples.SimpleConvex();
		case "nonconvex": return PolygonExamples.SimpleNonConvex();
		case "rectangle": return PolygonExamples.Rectangle(canvas);
		case "star": return PolygonExamples.RegularStar(1.0, 0.4, numvertices, 10, 10, 300, 300);
		default: return PolygonExamples.Rectangle(canvas);
	}
	return null; // should never happen
}

function chooseVertices(event)
{
	numVertices = Number(document.getElementById("vertices").value);
	restart();
}

function chooseNumBalls(event)
{
	numBalls = Number(document.getElementById("numballs").value);
	restart();
}

function chooseNumTrajectories(event)
{
	trajectoryDepth = Number(document.getElementById("trajectories").value);
	restart();
}

function chooseStartAngle(event)
{
	startAngle = Number(document.getElementById("startangle").value);
	restart();
}

function changePolygonType(event)
{
	polygontype = document.getElementById("polygontype").value;
	restart();
}

function checkBatchMode(event)
{
	batchMode = document.getElementById("batchmode").checked;
	if (batchMode)
	{
		trajectoryDepth = batchDataPoints;
		clearInterval(interval_ID);
		interval_ID = null;
		document.getElementById("start").innerText = "Start";
		document.getElementById("start").style.display = 'none';

		document.getElementById("myRange").style.display = 'none';
		document.getElementById("myRange_label").style.display = 'none';

		document.getElementById("trajectories").style.display = 'none';
		document.getElementById("trajectories_label").style.display = 'none';

	}
	else 
	{
		trajectoryDepth = Number(document.getElementById("trajectories").value);
		document.getElementById("start").style.display = 'inline';

		document.getElementById("myRange").style.display = 'inline';
		document.getElementById("myRange_label").style.display = 'inline';

		document.getElementById("trajectories").style.display = 'inline';
		document.getElementById("trajectories_label").style.display = 'inline';
	}
	
	
	restart();
}

function checkSymplecticMode()
{
	useSymplectic = document.getElementById("symplecticmode").checked;
	restart();
}


function runit()
{
	if (!interval_ID)
	{
		interval_ID = setInterval(draw, timerMilliseconds);
		document.getElementById("start").innerText = "Stop";
	}
	else 
	{
		clearInterval(interval_ID);
		interval_ID = null;
		document.getElementById("start").innerText = "Start";
	}
}

// function stopit()
// {
// 	clearInterval(interval_ID);
// 	interval_ID = null;
// 	// alert("stop pressed");
// }


// Funktion zur Zeichnung des Balls
function drawBall(x,y, color) 
{
	ctx.beginPath();
	ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
	ctx.fillStyle = color; //"#0095DD";
	ctx.fill();
	ctx.closePath();
}

// Funktion zur Darstellung des Polygons
function drawPolygon()
{
	ctx.beginPath();
	ctx.lineWidth = 1;

	ctx.moveTo(polygon[0].x, polygon[0].y);
	for (let i = 1; i < polygon.length; i++) 
	{
		ctx.lineTo(polygon[i].x, polygon[i].y);
	}
	ctx.closePath();
	ctx.stroke();
}

function drawTrajectories(trajectories, color = '#000000', dashStyle = [1, 4], linewidth = 1) // 1 dot followed by 4 spaces
{
	if (trajectories.length < 2) return;
	ctx.save();
	
	ctx.lineWidth = linewidth;
	ctx.beginPath();
	// let linedash = this.ctx.getLineDash(); // save the current
	let linestyle = ctx.strokeStyle; 
	ctx.strokeStyle = color;
	
	ctx.setLineDash(dashStyle);
	
	ctx.moveTo(trajectories[0].x, trajectories[0].y);
	for (let i = 1; i < trajectories.length; i++)
	{
		if (trajectories[i] != null)
			ctx.lineTo(trajectories[i].x, trajectories[i].y);
	}

	ctx.stroke();
	ctx.restore();
}

var chart = null;
var series =[];
var startindex;
var polygontype;
var billiardsBalls;

function restart()
{
	init();
	draw();
}

function setChartTitles()
{
	let title, xtitle, ytitle;
	if ( useSymplectic)
	{
		title = 'Symplectic Billiards - Current trajectory length by last length';
		xtitle = 'Last Trajectory length';
		ytitle = 'Current Trajectory length';
	}
	else
	{
		title = 'Euclidean Billiards - Trajectory length by reflection angle';
		xtitle = 'Reflection angle';
		ytitle = 'Trajectory length';
	}
	chart.setTitle(title);
	chart.setAxisTitles(xtitle, ytitle);

	if (useSymplectic)
	{
		chart.setXScale(0,1);
	}
	else
	{
		chart.setXScale(0,180);
	}
	
}


//wird nur einmal zur Initialisierung aufgerufen, macht die Berechnungen
function init()
{
	let startindex = 0;
	let lambda = 0.8; 
	//let startAngle = 30;
	billiardsBalls = new BilliardsBalls();
	

	//oldstartpoint = null;
	polygontype = document.getElementById("polygontype").value;
	polygon = choosePolygonType(polygontype, numVertices);
	// Let BilliardsBall set the ball at the startpoint
	for (let i = 0; i < numBalls; i++)
	{
		billiardsBalls[i] = new BilliardsBall(polygon, startindex, new Point(-1,-1), lambda, startAngle + 5*i, ballRadius,
											  ballColors[i % ballColors.length], trajectoryDepth, useSymplectic);
	}
		//billiardsBall = new BilliardsBall(polygon, startindex, new Point(-1,-1), lambda, angle, ballRadius); //wenn Punkt negative Koordinaten hat, wird er neu berechnet, mit ReCalc Funktion
	if (chart == null)
	{
		chart = new myChart(document.getElementById("scatterchart"));
	}
	chart.clearAllSeries();
	setChartTitles();
	
	for (let i = 0; i < billiardsBalls.length; i++)
	{
		series[i] = chart.addChartData((startAngle + 5*i)+"°", ballColors[i % ballColors.length]);
	}
	
	
	
}
var distance = Number(document.getElementById("myRange").value); // Ist die Schrittweite in Pixeln in der der Ball gezeichnet wird
var oldstartpoint = []; 

// Zeichne den Ball und das Polygon in jedem Frameset
function draw() 
{
	let trajectories = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPolygon();

	for (let i = 0; i < billiardsBalls.length; i++)
	{
		billiardsBall = billiardsBalls[i];
		billiardsBall.moveBall(distance); 
    	let actualPos = billiardsBall.getPosition(); // position before move
    	let startpoint = billiardsBall.getLineStartPoint();

	// bewegt den Ball um distance auf die nächste Zeichenposition, alles andere wird im Innenleben erledigt
    
		if (distance < 10)
		{
			ctx.beginPath();
			ctx.moveTo(startpoint.x, startpoint.y);
			if (actualPos.x > 0 && actualPos.y > 0)
				ctx.lineTo(actualPos.x , actualPos.y );
				//ctx.lineTo(startpoint.x , startpoint.y ); //dann hüpft er nur
			ctx.stroke();
		}

		
		if (actualPos.x != 0 && actualPos.y != 0)
		{
			if(!batchMode)
			drawBall(actualPos.x , actualPos.y , billiardsBall.ballColor);

			if (trajectoryDepth > 0 && distance < 10 )
			{
				trajectories = billiardsBall.trajectories.getAll();
				drawTrajectories(trajectories, billiardsBall.ballColor);
			}
		}
		
		if (oldstartpoint[i] != null && oldstartpoint[i] != startpoint)
		{
			let infopoint = billiardsBall.infopoint;
			infopoint.y /= canvas.height; //Normierung
			if (useSymplectic)
			{
				infopoint.x /= canvas.width;
			}
			if (actualPos.x > 0 && actualPos.y > 0 && infopoint != null && infopoint.x > 0 && infopoint.y > 0)
				chart.addDataPoint(series[i], infopoint);
		}
		oldstartpoint[i] = startpoint;


		if (batchMode)
		{
			
			// Hide the billiardsArea
			// billiardsArea.style.display="none";
			trajectoryDepth = batchDataPoints;
			let pointarray = []
			// move the ball distance points to the next drawing position. the rest is done inside moveBall

			for(let j = 0; j < batchDataPoints; j++)
			{
				let [cpoint, infopoint] = billiardsBall.calcNewBallDirection();
				if(infopoint != null && infopoint.x > 0) // chart.addDataPoint(ball.series, infopoint);
				{
					infopoint.y /= canvas.height; //Normierung
					if (useSymplectic)
					{
						infopoint.x /= canvas.width;
					}
					pointarray.push(infopoint);
				}
			}
			chart.addManyPoints(series[i], pointarray);
			
			let ballhistory = billiardsBall.trajectories.getAll();
			if (ballhistory.length > 0)
			{
				drawTrajectories(ballhistory, billiardsBall.ballColor);
			}
		}
		

	}
}
restart();
