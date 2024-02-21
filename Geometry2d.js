import {Point} from './Point.js';
import {Line} from "./Line.js";
import { SmoothCompare } from './SmoothCompare.js';

export class Geometry2d 
{
	constructor() {}

	static calcIntersectionPoint(l1, l2) //## Schnittpunkt zweier Geraden?
	{
		let d1 = l1.a * l2.b;
		let d2 = l2.a * l1.b;

		if (SmoothCompare.aboutEquals(d1, d2))
		  return null; // parallel

		let det = d1 - d2;

		let xs = (l1.c * l2.b - l2.c * l1.b) / det;
		let ys = (l1.a * l2.c - l2.a * l1.c) / det;

		return new Point(xs, ys);
	}

	static isPointInside(point, polygon) 
	{
		if (point == null || polygon == null)
		  return -1;

		let res = -1;
		for (let i = 0; i < polygon.length; i++) 
		{
			let j = (i + 1) % polygon.length;
			let result = Geometry2d.tripleProductSign(point, polygon[i], polygon[j]);
			res *= result;
			if (res === 0)
			break;
		}

		return res;
	}

	static tripleProductSign(p1, p2, p3) // #### Spatprodukt generell erklärem
	{
		let EPS_CROSS = 1.0e-8;

		if (SmoothCompare.aboutEquals(p1.y, p2.y) && SmoothCompare.aboutEquals(p2.y, p3.y)) 
		{
			if ((p2.x <= p1.x && p1.x <= p3.x) || (p3.x <= p1.x && p1.x <= p2.x))
				return 0;
			  else
				return 1;
		}

		if (Math.abs(p1.x - p2.x) < EPS_CROSS &&  Math.abs(p1.y - p2.y) < EPS_CROSS)
		// if (DoubleExtension.aboutEquals(p1.y, p2.y) && DoubleExtension.aboutEquals(p1.x, p2.x))
		  return 0;

		  if (p2.y > p3.y) // exchange point 2 and 3
		  {
			  var tmp = p2;
			  p2 = p3;
			  p3 = tmp;
		  }
// 		if (p2.y > p3.y) 
// 		{
// 			[p2, p3] = [p3, p2];
// 		}
		if (p1.y <= p2.y || p1.y > p3.y)
			return 1;

		let d1 = (p2.x - p1.x) * (p3.y - p1.y);
		let d2 = (p2.y - p1.y) * (p3.x - p1.x);

		if (Math.abs(d2 - d1) < EPS_CROSS) // || d1.AboutEquals(d2))
			return 0;

		return Math.sign(d2 - d1);
	}

// 	static Distance(p1, p2) 
// 	{
// 		let dx = p2.x - p1.x;
// 		let dy = p2.y - p1.y;
// 		return Math.hypot(dx ,dy);
// 	}

	static lineSegmentInsidePolygon(polygon, line, startpoint, endpoint) 
	{
		const lambda = 0.001;
		const p1 = new Point(0,0);
		const p2 = new Point(0.0);

		if (SmoothCompare.aboutEquals(line.b, 0.0)) 
		{
		  p1.y = lambda * startpoint.y + (1.0 - lambda) * endpoint.y; 
		  p1.x = line.c / line.a;
		  p2.y = (1.0 - lambda) * startpoint.y + lambda * endpoint.y;
		  p2.x = line.c / line.a;
		} 
		else 
		{
		  p1.x = lambda * startpoint.x + (1.0 - lambda) * endpoint.x;
		  p1.y = line.M * p1.x + line.B;
		  p2.x = (1.0 - lambda) * startpoint.x + lambda * endpoint.x;
		  p2.y = line.M * p2.x + line.B;
		}

			// both points are inside or on the border of the Polygon
		if (Geometry2d.isPointInside(p1, polygon) >= 0 && Geometry2d.isPointInside(p2, polygon) >= 0)
			return true;
		else
			return false;
	}
    
	static circumference(polygon) // wenn man normieren will
	{
		let u = 0;
		for (let i = 0; i < polygon.Length; i++)
		{
			let j = (i + 1) % polygon.Length;
			tx = polygon[j].x - polygon[i].x;
			ty = polygon[j].y - polygon[i].y;

			u += Math.sqrt(tx * tx + ty * ty);
		}
		return u;
	}
	
	static pointDistance(p1, p2) 
	{
		if (p1 == null || p2 == null) return 0.0;
		let dx = p2.x - p1.x;
		let dy = p2.y - p1.y;
		return Math.hypot(dx ,dy);
	}
}