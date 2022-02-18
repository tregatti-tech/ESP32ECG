// const WebSocket = require('ws');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ["http://localhost:8080", "http://192.168.1.136:8080"],
        methods: ["GET", "POST"]
    }
});
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); 

const PORT = process.env.PORT || 3000

// const wss = new WebSocket.Server({ port: PORT });

const csvData = [];
let jsonData = [];

const rStream = fs.createReadStream(path.join(__dirname, 'data', 'data2.csv'), { encoding: 'utf-8' });
rStream
        .pipe(csv())
        .on('data', dtChunk => csvData.push(dtChunk))
        .on('end', () => console.log('End of file...'));

fs.readFile(path.join(__dirname, 'data', 'ws.data'), 'utf8', function (err, data) {
    if (err) throw err;
    jsonData = JSON.parse(data);
})

// listen for connection from the clients 
io.on('connection', (socket) => {
    console.log('Client was connected.');

    let i = 0;
    // console.log(jsonData);

    socket.emit('message', JSON.stringify(jsonData[i]));
    let handler = setInterval(() => {
        i++;
        if(i < jsonData.length)
            socket.emit('message', JSON.stringify(jsonData[i]));
        else clearInterval(handler);
    }, 4000);

    socket.on('hello', msg => console.log(msg));

    socket.on('disconnect', () => {
        console.log('Client has diconnected.');
    })
})

http.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}...`);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught error: ${err}`);
    process.exit(1);
});