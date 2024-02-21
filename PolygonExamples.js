import { Point } from "./Point.js";

export class PolygonExamples
{
	constructor() { }

	corners;
	
	static RegularPolygon(radius, n, x1, y1, x2, y2) //quasi um den Mittelpunkt gezerrt und nach rechts verschoben
	{
		this.corners = n;
		let poly = [];
		for (let i = 0; i < n; i++)
		{
			let x = radius * Math.cos(2.0 * Math.PI * i / n)  *(x2 - x1) + x2;
			let y = radius * Math.sin(2.0 * Math.PI * i / n)  * (y2 - y1) + y2;
			poly.push(new Point(x, y)); 
		}
		return poly;
	}
	
	static RegularStar(radius1, radius2, n, x1, y1, x2, y2)
	{
		n *= 2;
		let poly = [];
		for (let i = 0; i < n; i++)
		{
			let x, y, r;
			r = (i % 2 == 0) ? radius1 : radius2;

			x = r * Math.cos(2.0 * Math.PI * i / n) * (x2 - x1) + x2;
			y = r * Math.sin(2.0 * Math.PI * i / n) * (y2 - y1) + y2;

			poly.push(new Point(x, y));
		}
		return poly;
	}
	
	static SimpleNonConvex()
	{
		return [new Point(150, 80) , new Point(100, 500),  new Point(300, 200), new Point(350, 500), new Point(400, 100)];
	}
	
	static SimpleConvex()
	{
		return [new Point(150, 80) , new Point(100, 500),  new Point(200, 600), new Point(350, 500), new Point(400, 100)];
	}

	static Rectangle(canvas)
	{
		let distFromCanvas = 10;
		
		return  [new Point(canvas.offsetLeft + distFromCanvas, distFromCanvas),
				 new Point(canvas.offsetLeft + distFromCanvas,  canvas.height - distFromCanvas),
				 new Point(canvas.offsetLeft + canvas.width - distFromCanvas,  canvas.height - distFromCanvas),
				 new Point(canvas.offsetLeft + canvas.width - distFromCanvas,  distFromCanvas)
				];
   }

   getCorners()
   {
	return this.corners;
   }
}


