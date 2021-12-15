let canvas = document.getElementById('holter');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");
let data = [0], index = 0;

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
    // console.log(msgCnt + ' ' + parsedData.length);
});

let maxVal = 1000;
let windowWidth = canvas.width;
let width = 1;
let ECGFilt = [];

let interval = setInterval(() => {
    //Clear partially
    ctx.clearRect((index % Math.floor(windowWidth / width)) * width, -1000, 30, 2000);
    if((index+1) % Math.floor(windowWidth / width) == 0) {
        ctx.clearRect(-10, -1000, 30, 2000);
        // data.push(Math.random() * 100);
        index++;
    }
    
    //FILTRATION
    let data1=0, data2=0;
    for(let i=0; i < 5; i++) {
        data1 += data[index + i];
        data2 += data[index + i + 1];
    }
    data1 /= 5;
    data2 /= 5;

    //DRAW LINES
    ctx.strokeStyle = "black"; 
    ctx.lineWidth = 3; 
    ctx.beginPath();
    ctx.moveTo((index % Math.floor(windowWidth / width)) * width, maxVal - data1);
    ctx.lineTo(((index+1) % Math.floor(windowWidth / width)) * width, maxVal - data2);
    ctx.stroke();
    index++;
}, 10);

drawGrid();

function drawGrid() {
    let canvas = document.getElementById('grid');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio;
    // let mmSize = window.screen.width / 34.02 / 10 * width;
    let mmSize = canvas.width / 17.02 / 5; //34.02cm is just my const width of the laptop. It varies on each device
    ctx.strokeStyle = "red";  

    for(let i=0; i < 200; i++) {
        if(i % 5 === 0) ctx.lineWidth = 2;
        else ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(i * mmSize, 0);
        ctx.lineTo(i * mmSize, window.screen.width);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * mmSize);
        ctx.lineTo(window.screen.width, i * mmSize);
        ctx.stroke();
    }
}