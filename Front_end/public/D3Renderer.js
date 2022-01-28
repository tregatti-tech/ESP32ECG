import * as d3 from 'https://unpkg.com/d3?module'


const width = 500;
const height = 300;
const margin = 50;

class D3Renderer {

    constructor() {
        let data = [];
        
        this.tempData = [];
        this.tempData1 = []
        this.tempData2 = [];
        
        for(let i=0; i < 1000; i++) {
            this.tempData.push({time: i % 1000, value: 0});
        }

        d3
            .select(".target")  // select the elements that have the class 'target'
            .style("stroke-width", 8)

        // gridlines in x axis function
        function make_x_gridlines(x) {		
            return d3.axisBottom(x)
        }

        // gridlines in y axis function
        function make_y_gridlines(y) {		
            return d3.axisLeft(y)
        }


        /* Add SVG */
        this.svg = d3.select("#real-time-plot").append("svg")
            .attr("width", (width+margin)+"px")
            .attr("height", (height+margin)+"px")
            .append('g')
            .attr("transform", `translate(${margin}, ${margin})`);



        function gridData() {
        var data = new Array();
        var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
        var ypos = 1;
        var width = 18;
        var height = 18;
        var click = 0;
        
        // iterate for rows	
        for (var row = 0; row <= 25; row++) {
            data.push( new Array() );
            
            // iterate for cells/columns inside rows
            for (var column = 0; column <= 25; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: width,
                height: height
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
            }
            // reset the x position after a row is complete
            xpos = 1;
            // increment the y position for the next row. Move it down 50 (height variable)
            ypos += height;	
        }
        return data;
        }

        var grid = gridData();	
        
        var row = this.svg.selectAll(".row")
            .data(grid)
            .enter().append("g")
            .attr("class", "row");
        
        var column = row.selectAll(".square")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("class","square")
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("width", function(d) { return d.width; })
            .attr("height", function(d) { return d.height; })
            .style("fill", "#f5f0f5")
            .style("stroke", "#ff0000")

        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([0, width-margin]);

        this.yScale = d3.scaleLinear()
            .domain([-20,20])
            .range([height-margin, 0]);

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

    drawCircle(x, y) {
        this.svg.append('circle')
            .attr('cx', this.xScale(x))
            .attr('cy', this.yScale(y))
            .attr('r', 2)
            .attr('stroke', 'black');
    }

    clearCircles() {
        this.svg.selectAll("circle").remove();
    }
}

export default D3Renderer;