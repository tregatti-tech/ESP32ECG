const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); 
const { json } = require('express/lib/response');
const { clearInterval } = require('timers');

const PORT = process.env.PORT || 3000

const wss = new WebSocket.Server({ port: PORT });

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
wss.on('connection', (ws) => {
    console.log('Client was connected.');

    // const rs = fs.createReadStream(path.join(__dirname, 'data', 'data2.csv'), { encoding: 'utf-8' }); 
    // rs
    //     .pipe(csv())
    //     .on('data', (dataChunk) => ws.send(JSON.stringify(dataChunk)))
    //     .on('end', () => console.log('CSV File Exhausted...'));

    let i = 0;
    // console.log(jsonData);

    ws.send(JSON.stringify(jsonData[i]));
    let handler = setInterval(() => {
        i++;
        if(i < jsonData.length)
            ws.send(JSON.stringify(jsonData[i]));
        else clearInterval(handler);
    }, 4000);

    ws.on('message', (data) => {
        // console.log(data);
        fs.writeFile(path.join(__dirname, 'data', 'record.wav'), data, err => {
            if (err) {
                console.error(err);
            } else {
                console.log('File was written successfully!');
            }
        });
    })

    ws.on('close', () => {
        console.log('Client has diconnected.');
    })
})

process.on('uncaughtException', (err) => {
    console.error(`Uncaught error: ${err}`);
    process.exit(1);
});