import {Point} from './Point.js';
import {Line} from './Line.js';
import {Geometry2d} from './Geometry2d.js';
import { SmoothCompare } from './SmoothCompare.js';
import { IntersectionPoint } from './IntersectionPoint.js';

export class BilliardsStep 
{
  constructor(polygon, startindex, startPoint, lambda = 0.5, angle = 10.0, usesymplectic = false) 
  {
    this.Polygon = polygon;
    if (polygon.length < 3) 
    {
      throw new Error("Polygon must have at least 3 points!");
    }

    this.IntersectionIndex = startindex;
    this.BallStartPoint = startPoint;
    this.BallEndPoint = startPoint;
	this.BallLine = null;
	this.useSymplectic = usesymplectic;

    this.#init(lambda, angle);
  }

  #init(lambda, angle) 
  {
		let i = this.IntersectionIndex % this.Polygon.length;
		let j = (i + 1) % this.Polygon.length;
		this.IntersectionIndex = i;

		let angleb = (angle % 180) * Math.PI / 180;
		if (angleb < 0) 
		{
			 angleb += Math.PI;
		}

		if (this.BallStartPoint != null && this.BallStartPoint.x < 0)
		{
			 this.BallStartPoint = this.reCalcStartPoint(this.Polygon[i], this.Polygon[j], lambda);
		}

		if (SmoothCompare.aboutEquals(angleb, 0)) 
		{
		  this.BallLine = new Line(this.Polygon[i], this.Polygon[j]);
		  this.BallEndPoint = this.BallStartPoint;
		  return;
		}

		this.BallLine = this.startLine(new Line(this.Polygon[i], this.BallStartPoint), this.BallStartPoint, angleb);
		this.BallEndPoint = this.BallStartPoint;
	}

	newBallDirection()
	{
		if(this.useSymplectic)
		{
			return this.newBallDirectionSymplectic();
		}
		else
		{
			return this.newBallDirectionEuklid();
		}
	}

	newBallDirectionEuklid() //newBallDirectionEuclidean
    {
		let j = this.IntersectionIndex % this.Polygon.length;
		let k = (j + 1) % this.Polygon.length;

		
		let infoPoint;
		let borderline = new Line(this.Polygon[j], this.Polygon[k]);
		[this.BallLine, infoPoint] = this.reflectionLine(this.BallLine, borderline, this.BallEndPoint);
		this.BallStartPoint = this.BallEndPoint;

		if (this.BallLine == borderline) 
		{
			let dist = Geometry2d.pointDistance(this.BallStartPoint, this.Polygon[j]);
			if (dist === 0) 
			{
				this.BallEndPoint = this.Polygon[k];
			} 
			else 
			{
				this.BallEndPoint = this.Polygon[j];
			}
			return infoPoint;
		}

		let intersections = this.calcAllIntersectionPoints(this.BallLine, this.BallStartPoint);
		if (intersections.length == 0) 
		{
			throw "No Endpoint found!";
		}

		if (intersections.length == 1)
		{
			this.IntersectionIndex = intersections[0].Index;
			this.BallEndPoint = intersections[0].BallEndPoint;
			return infoPoint;
		}

		let sortedlist = intersections.sort((a, b) => a.Distance - b.Distance);
		let p = this.selectEndPoint(sortedlist, this.BallStartPoint);
		if (p != null) 
		{
			this.IntersectionIndex = p.Index;
			this.BallEndPoint = p.BallEndPoint;
		} 
		else 
		{
			throw "No Endpoint found, mutiple points, no match!";
		}
		return infoPoint;
	}
   
    // newBallDirection()
    // {
	// 	let j = this.IntersectionIndex % this.Polygon.length;
	// 	let k = (j + 1) % this.Polygon.length;

		
	// 	let infoPoint;
	// 	let borderline = new Line(this.Polygon[j], this.Polygon[k]);
	// 	[this.BallLine, infoPoint] = this.reflectionLine(this.BallLine, borderline, this.BallEndPoint);
	// 	this.BallStartPoint = this.BallEndPoint;

	// 	if (this.BallLine == borderline) 
	// 	{
	// 		let dist = Geometry2d.pointDistance(this.BallStartPoint, this.Polygon[j]);
	// 		if (dist === 0) 
	// 		{
	// 			this.BallEndPoint = this.Polygon[k];
	// 		} 
	// 		else 
	// 		{
	// 			this.BallEndPoint = this.Polygon[j];
	// 		}
	// 		return infoPoint;
	// 	}

	// 	let intersections = this.calcAllIntersectionPoints(this.BallLine, this.BallStartPoint);
	// 	if (intersections.length == 0) 
	// 	{
	// 		throw "No Endpoint found!";
	// 	}

	// 	if (intersections.length == 1)
	// 	{
	// 		this.IntersectionIndex = intersections[0].Index;
	// 		this.BallEndPoint = intersections[0].BallEndPoint;
	// 		return infoPoint;
	// 	}

	// 	let sortedlist = intersections.sort((a, b) => a.Distance - b.Distance);
	// 	let p = this.selectEndPoint(sortedlist, this.BallLine, this.BallStartPoint);
	// 	if (p != null) 
	// 	{
	// 		this.IntersectionIndex = p.Index;
	// 		this.BallEndPoint = p.BallEndPoint;
	// 	} 
	// 	else 
	// 	{
	// 		throw "No Endpoint found, mutiple points, no match!";
	// 	}
	// 	return infoPoint;
	// }
   
    reflectionLine(ballline, borderline, reflectionpoint)
    {
        // m1*x+b1 trifft auf m2*x+b2 mit dem Einfallswinkel beta
        // zurückgegeben wird die durch den Ausfallswinkel an m2*x+b2 bestimmte Gerade zu m1*x+b1
        // Zuerst Schnittwinkel bestimmen
        // m1 * m2 = -1 gesondert behandeln, Geraden sind orthogonal

        // calculation of intersection angle and differential angle see:
        // https://de.wikipedia.org/wiki/Gerade#Schnittwinkel_zwischen_zwei_Geraden
        // https://rechneronline.de/winkel/einfallswinkel.php

        // denom_beta = ballline.a * borderline.a + ballline.b * borderline.b;
        let h1 = borderline.a * ballline.b;
        let h2 = ballline.a * borderline.b;
        let infoPoint;

        //  dist = calcMinDistance(IntersectionIndex, reflexionpoint);
        let dist = this.calcLengthBallLine();

        if (SmoothCompare.aboutEquals(h1,h2)) // special case: beta = 0°
        {
            infoPoint = new Point(0.0,dist);
            return [borderline,infoPoint];
        }

        let beta1 = ballline.a * borderline.a;
        let beta2 = -ballline.b * borderline.b;

        if (SmoothCompare.aboutEquals(beta1,beta2)) // 90°: reflexionline = ballline
        {
            infoPoint = new Point(90.0, dist);
            return [ballline,infoPoint];
        }
        let tan_beta = (h1 - h2) / (beta1 - beta2);

        // ****************************************************

        let angle = Math.atan(tan_beta);
        if (angle < 0) angle += Math.PI;
        angle = 180.0 * angle / Math.PI;

        infoPoint = new Point(angle,dist);

        // ****************************************************

        if (SmoothCompare.aboutEquals(borderline.b,0.0)) // Polygon line parallel to y-axis; alpha is 90°
        {
            // resulting angle: PI/2 - beta
            // as tan(PI/2 - beta) = 1 / tan(beta) handle the case 'tan(beta) = 0' separately:

            if (SmoothCompare.aboutEquals(tan_beta,0.0))
            {
                return [borderline, infoPoint];
            }
            else
            {
                let m = 1.0 / tan_beta;
                return [new Line(m, reflectionpoint.y - m * reflectionpoint.x), infoPoint];
            }
        }

        let tan_alpha = borderline.M;

        // delta = alpha - beta;
        let denom_delta = (1.0 + tan_alpha * tan_beta);

        if (SmoothCompare.aboutEquals(denom_delta,0.0)) // new line parallel to y-axis
        {
            let line = new Line(1.0, 0.0, reflectionpoint.x);
            return [line, infoPoint];
        }

        let tan_delta = (tan_alpha - tan_beta) / denom_delta;
        let b = reflectionpoint.y - tan_delta * reflectionpoint.x;

        let lp = new Line(tan_delta, -1, -b);
        return [lp, infoPoint];
    }

    
    startLine(borderline, point, angle)
	{
		let m, b;

		 if (SmoothCompare.aboutEquals(angle, Math.PI / 2.0))    // angle = 90°
		{
			if (SmoothCompare.aboutEquals(borderline.M, 0.0)) // parallel to x-axis
			{
				return new Line(1, 0, point.x); // therefore this line is parallel to y-axis
			}
			else if (Math.abs(borderline.M) >= Number.POSITIVE_INFINITY)
			{
				return new Line(0, 1, point.y);
			}
			else
			{
				m = -1.0 / borderline.M;
				b = point.y - m * point.x;
			}
		}
		else // angle != 90°
		{
			let z = Math.tan(angle);
			if (SmoothCompare.aboutEquals(borderline.M, 0.0))  // parallel to y-axis
			{
				m = 1.0 / z;
				b = point.y - m * point.x;
			}
			else if (Math.abs(borderline.M) >= Number.POSITIVE_INFINITY)
			{
				m = -1.0 / z;
				b = point.y - m * point.x;
			}
			else
			{
				m = (borderline.M - z) / (1.0 + borderline.M * z);
				b = point.y - m * point.x;
			}
		}
		return new Line(m, -1, -b);
	}
/**
 * 
 * @param {*} ballLine 
 * @param {*} ballstart 
 * @returns 
 */
    calcAllIntersectionPoints(ballLine, ballstart)
    {
        let list = [];

        for (let i = 0; i < this.Polygon.length; i++) 
        {
            if (i === this.IntersectionIndex) continue;
            let j = (i + 1) % this.Polygon.length;

            let p0 = this.calcIntersectionPoint(ballLine, new Line(this.Polygon[i], this.Polygon[j]));
            let res = Geometry2d.isPointInside(p0, this.Polygon);
            if (res === 0)
            {
                let d = Geometry2d.pointDistance(p0, ballstart);
                list.push(new IntersectionPoint(i, d, p0));
            }
        }
        return list;
    }

    selectEndPoint(sortedlist, ballpoint)
    {
        if (sortedlist.length == 1)
			return sortedlist[0];
			
		if (this.useSymplectic)
		{
			for (let i = 0; i < sortedlist.length; i++) 
			{
				let d = Geometry2d.pointDistance(ballpoint, sortedlist[i].BallEndPoint);
				if ( SmoothCompare.aboutEquals(d / 10.0, 0.0)) continue;
				return sortedlist[i];
			}
			return null;
		}
		else
		{
			for (let i = 0; i < sortedlist.length; i++) 
				if (Geometry2d.lineSegmentInsidePolygon(this.Polygon, new Line(ballpoint, sortedlist[i].BallEndPoint), 
														ballpoint, sortedlist[i].BallEndPoint))
					return sortedlist[i];
        }
        return null;
    }

    calcLengthBallLine()
    {
        return Geometry2d.pointDistance(this.BallStartPoint, this.BallEndPoint);
    }
    
	reCalcStartPoint(p1, p2, lambda) //lambda ist "Gewichtung"
	{
		// 0 < lambda < 1
		let startx, starty;

		if (SmoothCompare.aboutEquals(p1.x, p2.x)) //    if (Math.Abs(deltax) < EPS) 
		{
			if (SmoothCompare.aboutEquals(p1.y, p2.y))   //   if (Math.Abs(deltay) < EPS)
				return null; // throw "Both Points are identical!";
			else
			{
				starty = (lambda * p1.y + (1.0 - lambda) * p2.y);
				startx = p1.x;
			}
		}
		else
		{
			let deltax = p1.x - p2.x;
			let deltay = p1.y - p2.y;
			let m = deltay / deltax;

			startx = (lambda * p1.x + (1.0 - lambda) * p2.x);
			starty = (m * startx + p1.y - m * p1.x);
		}
		return new Point(startx, starty);
	}
	
	
	calcIntersectionPoint(l1, l2) 
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

	reflexionLineSymplectic(borderlineStart, borderlineEnd, startpoint)
	{
		let x2, y2;
		if (SmoothCompare.aboutEquals(borderlineStart.x, borderlineEnd.x))
		{
			x2 = startpoint.x;
			y2 = startpoint.y + 1.0;
		}
		else
		{
			x2 = startpoint.x + 1.0;
			y2 = (borderlineEnd.y - borderlineStart.y) / (borderlineEnd.x - borderlineStart.x) + startpoint.y;
		}
		return new Line(new Point(startpoint), new Point(x2, y2));
	}

	first = true;
	lastStartPoint = null;
	lastLength = 0;
	lastIndex = 0;
	
	newBallDirectionSymplectic()
	{
		if (this.first)  // start with a predefined angle and euklidian billard in the first step
		{
			this.first = false;
			this.lastStartPoint = new Point(this.BallStartPoint);
			this.lastIndex = this.IntersectionIndex;

			let p = this.newBallDirectionEuklid();
			this.lastLength = p.y;
			return new Point(0, this.lastLength);	
		}
		
		let j = this.IntersectionIndex % this.Polygon.length;
		let k = (j + 1) % this.Polygon.length;

		let	line =	this.reflexionLineSymplectic(this.Polygon[j], this.Polygon[k], this.lastStartPoint);
		this.BallStartPoint = this.BallEndPoint;
		
		let intersections = this.calcAllIntersectionPoints(line, this.BallStartPoint);
		if (intersections.length == 0) 
		{
			return new Point(0.0, 0.0); // stay with the current ballLine
			// throw "No Endpoint found!";
		}

		let sortedlist = intersections.sort((a, b) => b.Distance - a.Distance); // maximize first
		let p = this.selectEndPoint(sortedlist, this.lastStartPoint);
		if (p != null) 
		{
			this.lastIndex = this.IntersectionIndex;
			this.lastStartPoint = new Point(this.BallStartPoint);
	
			this.IntersectionIndex = p.Index;
			this.BallEndPoint = new Point(p.BallEndPoint);
			this.BallLine = new Line(new Point(this.BallStartPoint), this.BallEndPoint);
		} 
		else 
		{
			throw "No Endpoint found, mutiple points, no match!";
		}
		let tmplen = this.lastLength;
		this.lastLength = Geometry2d.pointDistance(this.BallStartPoint, this.BallEndPoint);
		return new Point(tmplen, this.lastLength);
	}
	

}

