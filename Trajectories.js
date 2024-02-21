import {Point} from './Point.js';
    
    export class Trajectories extends Array
    {
        maxDepth = 0;
        
        constructor (len)
        {
        	super(); // must call super class !!!
            this.maxDepth = Math.max(len, 0);
        }
        
        getMaxDepth()
        {
        	return this.maxDepth;
        }
        
        setMaxDepth(value)
        {
        	value = Math.max(value, 0);
        	if (value < this.maxDepth) 
				this.length = value; // delimit array
        	this.maxDepth = value;
		}
        
        push(point)
        {
            this.unshift(point); // insert at top: index = 0
            if (this.length > this.maxDepth) // remove the last one
                this.splice(-1, 1); //-1: von hinten, 1: einen weg
        }

        get(i)
        {
            if (i >= this.maxDepth || i < 0 || i >= this.length)
                return null;
            return this[i];
        }

        getAll() 
        { 
            return this;
        }  
    }
