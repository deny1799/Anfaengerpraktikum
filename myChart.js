// Copyright 2023, Denise Becker, Robin Hoffmann, All rights reserved.
import { Point } from "./Point.js";


export class myChart
{
    scatterdiagram;

    config = 
    {
        type: 'scatter',
        data: { 
            datasets: []
        },
        options: 
        {
            animation: false,
            scales: 
            {
                x: { title: { display: true, text: 'Reflection angle' }, suggestedMin: 0, suggestedMax: 180 },
                y: { title: { display: true, text: 'Trajectory length' },suggestedMin: 0, suggestedMax: 1 }
            },
          responsive: true,
          plugins: 
          {
            legend: 
            {
              position: 'top',
            },
              title: 
              { 
                display: true,
                text: 'Symplectic Billiards - Trajectory length by reflection angle', 
              }
            
            }
        }
      }
    

    constructor(id)
    {
        this.scatterdiagram = new Chart(id,this.config);
      
    }

    addChartData(label, color)
	{
		let series = [];
		this.scatterdiagram.data.datasets.push({
                                    label: label,
                                    backgroundColor: color,
                                    data: series
								});
		this.scatterdiagram.update();
		return series; //  the dataset
	}

  addDataPoint(series, infopoint)
	{
		if (series == null) return;
		// if (seriesIndex < 0 || seriesIndex >= this.scatterdiagram.data.datasets.length) return;
		if (infopoint == null) return;

		let seriesData = series;
    seriesData.push(infopoint);
    this.scatterdiagram.update();
	}

  addManyPoints(series, infoarray)
	{
		let len = series.length;
		let i = 0;
		for(let j = 0; j < infoarray.length; j++)
			series[j + len] = infoarray[j];
      this.scatterdiagram.update();
	}

  destroy()
  {
    this.scatterdiagram.destroy();
  }

	clearAllSeries()
	{
		this.scatterdiagram.data.datasets = [];
		this.scatterdiagram.update();
	}

	
	setTitle(title)
	{
		this.scatterdiagram.options.plugins.title.text = title;
	}
	
	// so kann man die Optionen auch setzen:
	setAxisTitles(xtitle, ytitle)
	{
		let p = this.scatterdiagram.options.scales;
		p.x.title.display = true;
		p.x.title.text = xtitle;
		p.y.title.display = true;
		p.y.title.text = ytitle;
	}

  setXScale(min,max)
  {
    this.scatterdiagram.options.scales.x.min = min;
    this.scatterdiagram.options.scales.x.max = max;
  }

}


