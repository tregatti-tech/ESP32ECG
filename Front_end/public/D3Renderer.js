import * as d3 from 'https://unpkg.com/d3?module'

const width = 500;
const height = 300;
const margin = 50;

// gridlines in x axis function
function make_x_gridlines(x) {		
    return d3.axisBottom(x)
}

// gridlines in y axis function
function make_y_gridlines(y) {		
    return d3.axisLeft(y)
}

class D3Renderer {

    constructor() {
        let data = [];
        
        this.scale = 1;
        this.tempData = [];
        this.tempData1 = [];
        this.tempData2 = [];
        
        for(let i=0; i < 1000; i++) {
            this.tempData.push({time: i % 1000, value: 0});
        }

        d3
            .select(".target")  // select the elements that have the class 'target'
            .style("stroke-width", 8)

        /* Add SVG */
        this.svg = d3.select("#real-time-plot").append("svg")
            .attr("width", (width+margin)+"px")
            .attr("height", (height+margin)+"px")
            .append('g')
            .attr("transform", `translate(${margin}, ${margin})`);


        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([0, width-margin]);

        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([height-margin, 0]);

        this.drawGrid(this.tempData);

        /* Add line into SVG */
        var line = d3.line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.value));
        
        this.svg.append('path')
            .attr('class', 'line1')
            .attr('d', line(data)); 

        this.svg.append('path')
            .attr('class', 'line2')
            .attr('d', line(data)); 

        /* Add Axis into SVG */
        var xAxis = d3.axisBottom(this.xScale).ticks(5);
        var yAxis = d3.axisLeft(this.yScale).ticks(5);


        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height-margin})`)
            .call(xAxis);

        this.svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append('text')
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#F00");

        
        this.svg.append("g")
            .selectAll("circle")
            .data(data).enter()
            .append("g")
            .attr("class", "circle")
            .append("circle")
            .attr("cx", d => xScale(d.time))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4);
    }

    update(index, filteredData, filteredLowPassData, lowPass) {
        
        
        if(filteredData[index] !== undefined) {     
            if(lowPass) {
                this.tempData[index % 1000] = {time: index % 1000, value: filteredLowPassData[index]};
            }
            else
                this.tempData[index % 1000] = {time: index % 1000, value: filteredData[index]};
    
            this.tempData1 = this.tempData.slice(0, (index+1) % 1000);
            this.tempData2 = this.tempData.slice((index+20) % 1000);
        }

        this.xScale = d3.scaleLinear()
            .domain([0, 1000 / this.scale])
            .range([0, width-margin]);
        
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData))
            .range([height-margin, 0]);

        var line = d3.line()
            .x(d => this.xScale(d.time))
            .y(d => this.yScale(d.value));
        
        this.svg.select(".line1")
            .attr('d', line(this.tempData1));    

        this.svg.select(".line2")
            .attr('d', line(this.tempData2)); 
        
        /* Add Axis into SVG */
        var xAxis = d3.axisBottom(this.xScale).ticks(5);
        var yAxis = d3.axisLeft(this.yScale).ticks(5);


        this.svg.select(".x.axis")
            .call(xAxis);

        this.svg.select(".y.axis")
            .call(yAxis);
    }

    drawPreviousData(data) {
        d3.select("#real-time-plot").select("svg").attr("width", (data.length / 2 + margin)+"px");
        
        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, data.length / 2 - margin]);
        
        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([height-margin, 0]);

        this.drawGrid(data);


        this.yScale = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([height-margin, 0]);

        /* Add Axis into SVG */
        var xAxis = d3.axisBottom(this.xScale).ticks(5);
        var yAxis = d3.axisLeft(this.yScale).ticks(5);


        this.svg.select(".x.axis")
            .call(xAxis);

        this.svg.select(".y.axis")
            .call(yAxis);

        let staticTempData = data.reduce((acc, el, index) => {
            acc.push({ time: index, value: el });
            return acc;
        }, []);
        
        var line = d3.line()
            .x(d => this.xScale(d.time))
            .y(d => this.yScale(d.value));
    
        this.svg.append("path").attr("class", 'line1')
            .attr('d', line(staticTempData));    
    }

    drawGrid(data) {

        const tickValsSmall = [];
        for (let i = 0; i < data.length; i += 10) {
            tickValsSmall.push(i);
        }

        const tickValsSmallX = [];
        for (let i = 0; i < 1000; i += 18) {
            tickValsSmallX.push(i);
        }

        // add the X gridlines
        this.svg.append("g")			
            .attr("class", "gridSmallX")		
            .attr("stroke-width", 0.5)
            .call(make_y_gridlines(this.yScale)
                .tickValues(tickValsSmallX)
                .tickSize(-data.length / 2 + margin)
                .tickFormat(""));
        

        // add the Y gridlines
        this.svg.append("g")			
            .attr("class", "gridSmallY")			
            .attr("stroke-width", 0.5)
            .attr("transform", "translate(0," + (height - margin) + ")")
            .call(make_x_gridlines(this.xScale)
                .tickValues(tickValsSmall)
                // .ticks(data.length / 10)
                .tickSize(-height + margin)
                .tickFormat(""));
    
        const tickVals = [];
        for (let i = 0; i < data.length; i+=50) {
            tickVals.push(i);
        }

        const tickValsX = [];
        for (let i = 0; i < 1000; i += 90) {
            tickValsX.push(i);
        }

        // add the X gridlines
        this.svg.append("g")			
            .attr("class", "gridX")		
            .attr("stroke-width", 1.5)
            .call(make_y_gridlines(this.yScale)
                .tickValues(tickValsX)
                .tickSize(-data.length / 2 + margin)
                .tickFormat(""));


        // add the Y gridlines
        this.svg.append("g")			
            .attr("class", "gridY")				
            .attr("stroke-width", 1.5)
            .attr("transform", "translate(0," + (height - margin) + ")")
            .call(make_x_gridlines(this.xScale)
                // .ticks(Math.round(data.length / 40))
                .tickValues(tickVals)
                .tickSize(-height + margin)
                .tickFormat(""));
    }

    drawCircle(x, y) {
        this.svg.append('circle')
            .attr('cx', this.xScale(x))
            .attr('cy', this.yScale(y))
            .attr('r', 2)
            .attr('stroke', 'black');
    }

    drawPoincareDots(x, y) {
        this.svg.append('circle')
            .attr('cx', this.xScale(x))
            .attr('cy', this.yScale(y))
            .attr('r', 2)
            .style('fill', '#000000')
            .attr('stroke', 'black');
    }

    drawPoincareAxis() {
        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([0, width - margin]);
        
        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([height-margin, 0]);

        /* Add Axis into SVG */
        var xAxis = d3.axisBottom(this.xScale).ticks(5);
        var yAxis = d3.axisLeft(this.yScale).ticks(5);

        this.svg.select(".x.axis")
            .call(xAxis);

        this.svg.select(".y.axis")
            .call(yAxis);

        var line = d3.line()
        .x(d => this.xScale(d.time))
        .y(d => this.yScale(d.value));
        
        this.svg.append('path')
            .attr('class', 'line1')
            .attr('d', line([{ time: 0, value: 0 }, { time: 1000, value: 1000 }]));   
    }

    setScale(newScale) {
        this.scale = newScale;

        this.xScale = d3.scaleLinear()
            .domain([0, 1000 / this.scale])
            .range([0, width-margin]);
        
        this.yScale = d3.scaleLinear()
            .domain([0, 1000 / this.scale])
            .range([height-margin, 0]);

        this.clearGrid();

        this.drawGrid(this.tempData);
    }

    clearCircles() {
        this.svg.selectAll("circle").remove();
    }

    clearGrid() {
        this.svg.select('.gridSmallX').remove();
        this.svg.select('.gridX').remove();
        this.svg.select('.gridSmallY').remove();
        this.svg.select('.gridY').remove();
    }

    clearAll() {
        this.clearCircles();
        this.clearGrid();
        this.svg.select(".line1").remove();    
        this.svg.select(".line2").remove(); 

    }
}

export default D3Renderer;