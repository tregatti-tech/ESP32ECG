let canvas = document.getElementById('holter');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");
let data = [0], index = 0;

// for production we should use wss, but for development ws is fine 
const ws = new WebSocket('ws://localhost:3000');

const yValues = [];

ws.addEventListener('open', () => {
    console.log('We are connected!');

    // ws.send('Hey! How is it going?');
});


let cnt = 0;
let stop = false;
let realTimePlot = null;

ws.addEventListener('message', (msg) => {
    // some tests
    // console.log('DATA TYPE: ' + typeof msg.data)
    // console.log(`New message from server: ${msg.data}.`);
    const parsedData = JSON.parse(msg.data);
    // console.log(parsedData);
    data.push(parsedData.A);
    // data.push(Math.random() * 800);

    // ctx.clearRect((index % 100) * 5, -100, 30, 200);
    // if((index+1) % 100 == 0) {
    //     ctx.clearRect(-10, -100, 20, 200);
    //     index++;
    // }

    // ctx.beginPath();
    // ctx.moveTo((index % 100) * 5, +data[index]);
    // ctx.lineTo(((index+1) % 100) * 5, +data[index + 1]);
    // ctx.stroke();
    // index++;
});

let maxVal = 1000;
let windowWidth = canvas.width;
let width = 5;

let interval = setInterval(() => {
    // data.push(Math.random() * 100);
    // console.log(index % 100, data[index]);
    ctx.clearRect((index % Math.floor(windowWidth / width)) * width, -1000, 30, 2000);
    if((index+1) % Math.floor(windowWidth / width) == 0) {
        ctx.clearRect(-10, -1000, 30, 2000);
        // data.push(Math.random() * 100);
        index++;
    }
    if(data[index] > maxVal) maxVal = data[index];

    ctx.strokeStyle = "green"; 
    ctx.lineWidth = 3; 
    ctx.beginPath();
    ctx.moveTo((index % Math.floor(windowWidth / width)) * width, maxVal - data[index]);
    ctx.lineTo(((index+1) % Math.floor(windowWidth / width)) * width, maxVal - data[index + 1]);
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
    ctx.strokeStyle = "grey";  

    for(let i=0; i < 200; i++) {
        if(i % 5 === 0) ctx.lineWidth = 1;
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