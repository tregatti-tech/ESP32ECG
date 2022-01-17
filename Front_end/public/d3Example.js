import * as d3 from 'https://unpkg.com/d3?module'
console.log(d3.event)


var width = 500;
var height = 300;
var margin = 50;

// const data = [];
// for(let i=0; i < 100; i++) data.push({date: i, value: Math.random()});

let data = [];

// for production we should use wss, but for development ws is fine 
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
    console.log('We are connected!');

    // ws.send('Hey! How is it going?');
});

let cnt = 0;
let stop = false;
let realTimePlot = null;

// let msgCnt = 0;
ws.addEventListener('message', (msg) => {
    // msgCnt++;
    const parsedData = JSON.parse(msg.data);
    // console.log(parsedData);
    parsedData.map(el => {
        data.push(+el.A);
    })
    console.log(data);
});

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
var svg = d3.select("#real-time-plot").append("svg")
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
    
  var row = svg.selectAll(".row")
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
  var xScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, width-margin]);

  var yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .range([height-margin, 0]);
  
  /* Add line into SVG */
  var line = d3.line()
  .x(d => xScale(d.time))
  .y(d => yScale(d.value));
    
  svg.append('path')
  .attr('class', 'line1')
  .attr('d', line(data)); 

  svg.append('path')
    .attr('class', 'line2')
    .attr('d', line(data)); 

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
    .attr("fill", "#F00");

// svg.append('path')
//   .attr('class', 'line')
//   .attr('d', line(data));




let index = 0;
let tempData = [], tempData1 = [], tempData2 = [];
for(let i=0; i < 1000; i++) {
  tempData.push({time: i, value: 800});
}
let interval = setInterval(() => {
    console.log("UPDATE")
  
    //FILTRATION
    let data1=0, data2=0;
    for(let i=0; i < 5; i++) {
        data1 += data[index + i];
        data2 += data[index + i + 1];
    }
    data1 /= 5;
    data2 /= 5;
    if(!Number.isNaN(data1))
    {
      tempData[index % 1000] = {time: index % 1000, value: data1};
      tempData2 = tempData.slice((index+20) % 1000);
      tempData1 = tempData.slice(0, (index+1) % 1000);
    }


  var xScale = d3.scaleLinear()
    .domain([0, 1000])
    .range([0, width-margin]);

  var yScale = d3.scaleLinear()
    // .domain(d3.extent(tempData, d => d.value))
    .domain([700, 900])
    .range([height-margin, 0]);
  
  var line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value));
    
  svg.select(".line1")
    .attr('d', line(tempData1)); 

  svg.select(".line2")
    .attr('d', line(tempData2)); 
    
  /* Add Axis into SVG */
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);


  svg.select(".x.axis")
    .call(xAxis);

  svg.select(".y.axis")
    .call(yAxis);

    index++;
}, 4);
