import * as d3 from 'https://unpkg.com/d3?module'
console.log(d3.event)


var width = 500;
var height = 300;
var margin = 50;

const data = [];
for(let i=0; i < 100; i++) data.push({date: i, value: Math.random()});

d3
  .select(".target")  // select the elements that have the class 'target'
  .style("stroke-width", 8)

/* Scale */
var xScale = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([0, width-margin]);

var yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([height-margin, 0]);


/* Add SVG */
var svg = d3.select("#root").append("svg")
  .attr("width", (width+margin)+"px")
  .attr("height", (height+margin)+"px")
  .append('g')
  .attr("transform", `translate(${margin}, ${margin})`);


/* Add line into SVG */
var line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value));

svg.append('path')
  .attr('class', 'line')
  .attr('d', line(data));


/* Add circles in the line */
svg.append("g")
  .selectAll("circle")
  .data(data).enter()
  .append("g")
  .attr("class", "circle")
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .style("fill", "red")
        .append("text")
        .attr("class", "text")
        .text(d.value)
        .attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.value) - 5);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style("fill", "black")
        .select("text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.date))
  .attr("cy", d => yScale(d.value))
  .attr("r", 4);


/* Add Axis into SVG */
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(5);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height-margin})`)
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append('text')
  .attr("y", 15)
  .attr("transform", "rotate(-90)")
  .attr("fill", "#000")
  .text("Total values");
