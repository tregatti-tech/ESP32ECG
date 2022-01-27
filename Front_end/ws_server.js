const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); 

const PORT = process.env.PORT || 3000

const wss = new WebSocket.Server({ port: PORT });

const csvData = [];

const rStream = fs.createReadStream(path.join(__dirname, 'data', 'ws.csv'), { encoding: 'utf-8' });
rStream
        .pipe(csv({ headers: false }))
        .on('data', dtChunk => { 
            csvData.push(dtChunk);
            // console.log(dtChunk);
            // console.log(Object.keys(dtChunk).length);
        })
        .on('end', () => console.log('End of file...'));

// listen for connection from the clients 
wss.on('connection', (ws) => {
    console.log('Client was connected.');

    let i = 0;

    // ws.send(JSON.stringify(csvData.slice(0, 1000))); // it was for old data (data2.csv)

    // every row we know that is 4s, so time duration in seconds is number of rows mult. by 4
    const sendDataInterval = setInterval(() => {
        // i += 1000;
        // ws.send(JSON.stringify(csvData.slice(i, i + 1000)));
        if (i >= csvData.length) {
            console.log('TIMEOUT...!');
            clearInterval(sendDataInterval);
        } else {
            ws.send(JSON.stringify(csvData[i]));
            // console.log(csvData[i]);
            // console.log(Object.keys(csvData[i]).length);
            i++;
        }
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