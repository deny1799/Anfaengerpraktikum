import {BilliardsBall} from './BilliardsBall.js'

export class BilliardsBalls extends Array
{

	contructor()
	{
	}

	clear()
	{
		for (let i = 0; i < this.length; i++)
			this[i].clear();
		base.clear();
	}
	
	setTrajectoriesMaxDepth(depth)
	{
		for(let i = 0; i < this.length; i++)
			this[i].setTrajectoriesMaxDepth(depth);
	}

	NewDirections()
	{
		for(let i = 0; i < this.length; i++)
			this[i].calcNewBallDirection();
	}
}