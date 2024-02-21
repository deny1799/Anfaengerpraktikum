export class Point 
{
	constructor(x = 0, y = 0) 
	{
	    if (x == null || y == null)
		{
			this.x = 0;
			this.y = 0;
		}
		else
		if (typeof x === 'number' && typeof y === 'number') 
		{
			this.x = x;
			this.y = y;
		}
		else if (x instanceof Point)
		{
			this.x = x.x;
			this.y = x.y;
		}
		else throw("Invalid Parameter of Point");
	}
}

/* Alternative zu Point
 class Point 
 {
    constructor(x, y) 
    {
        this.x = x;
        this.y = y;
    }

    static fromPoint(point) 
    {
        return new Point(point.x, point.y);
    }

    static fromPointF(pointF) 
    {
        return new Point(pointF.x, pointF.y);
    }

    static fromPoint(otherPoint) 
    {
        return new Point(otherPoint.x, otherPoint.y);
    }
}

Beispiele für Aufruf:
const point1 = new Point(10, 20); // Instanz erstellen mit x = 10 und y = 20

const point2 = Point.fromPoint(new Point(5, 15)); // Instanz aus einem Point erstellen

const point3 = Point.fromPointF(new PointF(7.5, 12.5)); // Instanz aus einem PointF erstellen

const point4 = Point.fromPoint(point1); // Instanz aus einer anderen Point-Instanz erstellen
*/