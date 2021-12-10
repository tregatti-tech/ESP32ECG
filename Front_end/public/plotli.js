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
    cnt++;
    // console.log('DATA TYPE: ' + typeof msg.data)
    // console.log(`New message from server: ${msg.data}.`);
    const parsedData = JSON.parse(msg.data);
    // console.log(parsedData);
    // console.log(+parsedData.A + 70);

    // using the data
    if (cnt === 1) {
        Plotly.plot('real-time-plot', [
            {
                y: [+parsedData.A],
                type: 'line'
            }
        ])
        realTimePlot = document.getElementById('real-time-plot');
        console.log('realtimeplot: ' + realTimePlot);
    } else {
        if (!stop) {
            Plotly.extendTraces('real-time-plot', { y: [[+parsedData.A]] }, [0]);
        }
    }
    
    if (cnt > 500) {
        // console.log('here');
        Plotly.relayout('real-time-plot', {
            xaxis: {
                range: [cnt-500, cnt]
            }
        });
    }
    console.log(realTimePlot);
    // console.log('There');
    realTimePlot.on('plotly_click', function(){
        stop = true;
        // alert('You clicked this Plotly chart!');
        console.log('Plotly Chart Clicked!');
    });
});