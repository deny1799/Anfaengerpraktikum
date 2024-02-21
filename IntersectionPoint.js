import {Point} from './Point.js';

export class IntersectionPoint
{
	Index;
	Distance;
	BallEndPoint;

	constructor(ind, dist, endpoint)
	{
		this.Index = ind;
		this.Distance = dist; 
		this.BallEndPoint = endpoint;
	}
}