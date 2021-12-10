let canvas = document.getElementById('holter');
let ctx = canvas.getContext("2d");
let data = [0], index = 0;


let interval = setInterval(() => {
    data.push(Math.random() * 100);
    // console.log(index % 100, data[index]);
    ctx.clearRect((index % 100) * 5, -100, 30, 200);
    if((index+1) % 100 == 0) {
        ctx.clearRect(-10, 0, 20, 200);
        data.push(Math.random() * 100);
        index++;
    }

    ctx.beginPath();
    ctx.moveTo((index % 100) * 5, data[index]);
    ctx.lineTo(((index+1) % 100) * 5, data[index + 1]);
    ctx.stroke();
    index++;
}, 100);