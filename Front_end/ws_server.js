const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); 

const PORT = process.env.PORT || 3000

const wss = new WebSocket.Server({ port: PORT });

const csvData = [];

const rStream = fs.createReadStream(path.join(__dirname, 'data', 'data2.csv'), { encoding: 'utf-8' });
rStream
        .pipe(csv())
        .on('data', dtChunk => csvData.push(dtChunk))
        .on('end', () => console.log('End of file...'));

// listen for connection from the clients 
wss.on('connection', (ws) => {
    console.log('Client was connected.');

    // const rs = fs.createReadStream(path.join(__dirname, 'data', 'data2.csv'), { encoding: 'utf-8' }); 
    // rs
    //     .pipe(csv())
    //     .on('data', (dataChunk) => ws.send(JSON.stringify(dataChunk)))
    //     .on('end', () => console.log('CSV File Exhausted...'));

    let i = 0;

    ws.send(JSON.stringify(csvData.slice(0, 1000)));
    setInterval(() => {
        i += 1000;
        ws.send(JSON.stringify(csvData.slice(i, i + 1000)));
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