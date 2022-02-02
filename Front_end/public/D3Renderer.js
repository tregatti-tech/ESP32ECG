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


        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([0, width-margin]);

        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([height-margin, 0]);


        
        // add the X gridlines
        this.svg.append("g")			
            .attr("class", "gridSmallX")
            .attr("stroke-width", 0.5)
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.xScale)
                .ticks(100)
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        this.svg.append("g")			
            .attr("class", "gridSmallY")
            .attr("stroke-width", 0.5)
            .call(make_y_gridlines(this.yScale)
                .ticks(70)
                .tickSize(-width)
                .tickFormat("")
            )

        // add the X gridlines
        this.svg.append("g")			
            .attr("class", "gridX")
            .attr("stroke-width", 1.5)
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.xScale)
                .ticks(20)
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        this.svg.append("g")			
            .attr("class", "gridY")
            .attr("stroke-width", 1.5)
            .call(make_y_gridlines(this.yScale)
                .ticks(14)
                .tickSize(-width)
                .tickFormat("")
            )

            


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
        console.log(data);
        d3.select("#real-time-plot").select("svg").attr("width", (data.length + margin)+"px");
        
        
        /* Scale */
        this.xScale = d3.scaleLinear()
            .domain([0, data.length])
            .range([0, data.length - margin]);
        
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([height-margin, 0]);

        // add the X gridlines
        this.svg.select(".gridSmallX")
            .attr("stroke-width", 0.5)
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.xScale)
                .ticks(100)
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        this.svg.select(".gridSmallY")
            .attr("stroke-width", 0.5)
            .call(make_y_gridlines(this.yScale)
                .ticks(70)
                .tickSize(-width)
                .tickFormat("")
            )

        // add the X gridlines
        this.svg.select(".gridX")
            .attr("stroke-width", 1.5)
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines(this.xScale)
                .ticks(20)
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        this.svg.select(".gridY")
            .attr("stroke-width", 1.5)
            .call(make_y_gridlines(this.yScale)
                .ticks(14)
                .tickSize(-width)
                .tickFormat("")
            )
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

    clearAll() {
        this.clearCircles();
        this.svg.select(".line1")
            .attr('d', []);    

        this.svg.select(".line2")
            .attr('d', []); 
    }
}

export default D3Renderer;