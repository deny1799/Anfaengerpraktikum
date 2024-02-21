import {Point} from './Point.js';
import {Line} from './Line.js';
import {Geometry2d} from './Geometry2d.js';
import {BilliardsStep} from './BilliardsStep.js'
import { SmoothCompare } from './SmoothCompare.js';
import { Trajectories } from './Trajectories.js';

export class BilliardsBall 
{
    ballRadius;
    current;
    billiardsStep;
    ballColor;
    trajectories;

    constructor(polygon, startindex, startpoint, lambda, angle, ballradius, ballcolor, maxdepth,usesymplectic) 
    {
        this.ballRadius = ballradius;
        this.current = new Point();
        this.billiardsStep = new BilliardsStep(polygon, startindex, startpoint, lambda, angle, usesymplectic);
        this.ballColor = ballcolor;
        this.trajectories = new Trajectories(maxdepth);
    }

    moveBall(distance) 
    {
        let dummy = null;
        const ballpoint = this.billiardsStep.BallStartPoint;
        const ballendpoint = this.billiardsStep.BallEndPoint;
        const dist = this.ballRadius / 2;

        if (ballpoint === ballendpoint)
        {
            return this.calcNewBallDirection();
        }
        
        let lp = new Line(ballpoint, ballendpoint);

        if (Math.abs(ballendpoint.x - ballpoint.x) >= Math.abs(ballendpoint.y - ballpoint.y) || SmoothCompare.aboutEquals(lp.M,0.0)) 
        {
            if (ballendpoint.x <= ballpoint.x) 
            {
                this.current.x -= distance;
                if (this.current.x <= ballendpoint.x + dist)
                    [this.current, dummy] = this.calcNewBallDirection();
                else
                    this.current.y = (-lp.a * this.current.x + lp.c) / lp.b;
            } 
            else 
            {
                this.current.x += distance;
                if (this.current.x >= ballendpoint.x - dist)
                [this.current, dummy] = this.calcNewBallDirection();
                else
                    this.current.y = (-lp.a * this.current.x + lp.c) / lp.b;
            }
        }
         else
        {
            if (ballendpoint.y <= ballpoint.y) 
            {
                this.current.y -= distance;
                if (this.current.y <= ballendpoint.y + dist)
                [this.current, dummy] = this.calcNewBallDirection();
                else
                    this.current.x = (-lp.b * this.current.y + lp.c) / lp.a;
            } 
            else 
            {
                this.current.y += distance;
                if (this.current.y >= ballendpoint.y - dist)
                [this.current, dummy] = this.calcNewBallDirection();
                else
                    this.current.x = (-lp.b * this.current.y + lp.c) / lp.a;
            }
        }
        return this.current;
    }

    infopoint;
    calcNewBallDirection()
    {
        this.trajectories.push(new Point(this.billiardsStep.BallEndPoint)); // push a copy to line history
        this.infopoint = this.billiardsStep.newBallDirection();
        this.current = new Point(this.billiardsStep.BallStartPoint);
        return [this.current, this.infopoint];
    }

    clear() 
    {
        this.billiardsStep = null;
        this.current = null;
    }

    getPosition() 
    {
        return this.current;
    }

    setPosition(pos) 
    {
        this.current = pos;
    }

    getLineStartPoint()
    {
        return this.billiardsStep.BallStartPoint;
    }

    getLineEndPoint() 
    {
        return this.billiardsStep.BallEndPoint;
    }

    
}