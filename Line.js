import { Point } from './Point.js';

export class Line 
{
    // y = M * x + B
    M = 0.0;
    B = 0.0;

    a = 0.0;
    b = 0.0;
    c = 0.0;
    

    constructor(arg1 = 0, arg2 = 0, arg3 = null) 
    {
    	if (typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number') 
        {
            this.a = arg1;
            this.b = arg2;
            this.c = arg3;

            if (Math.abs(arg2) > 2.0 * Number.EPSILON) //arg2 != 0 
            {
                this.M = -arg1 / arg2;
                this.B = arg3 / arg2;
            } 
            else 
            {
                this.M = Number.MAX_VALUE; //unendlich oder NaN
                this.B = Number.MAX_VALUE;
            }
        }
        else if (typeof arg1 === 'number' && typeof arg2 === 'number') 
        {
            this.M = arg1;
            this.B = arg2;

            this.a = -arg1;
            this.b = 1.0;
            this.c = arg2;
        } 
        else if (arg1 instanceof Point && arg2 instanceof Point) 
        {
            // Aus 2 Punkte Form wird dann die Koordinatendarstellung erzeugt:
            // (y - y1) * (x2 - x1) = (x - x1) * (y2 - y1)
            // ergo:   (y1 - y2) * x + (x2 - x1) * y = y1 * (x2 - x1) - x1 * (y2 - y1)
            // ergo a = y1 - y2, b = x2 - x1, c = y1 * (x2 - x1) - x1 * (y2 - y1)

            this.a = arg1.y - arg2.y;
            this.b = arg2.x - arg1.x;
            this.c = arg1.y * (arg2.x - arg1.x) - arg1.x * (arg2.y - arg1.y);

            if (Math.abs(this.b) > 2.0 * Number.EPSILON)
            {
                this.M = -this.a / this.b;
                this.B = this.c / this.b;
            } 
            else 
            {
                this.M = Number.MAX_VALUE;
                this.B = Number.MAX_VALUE;
            }
        }
    }
}
