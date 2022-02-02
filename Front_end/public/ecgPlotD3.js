import D3Renderer from './D3Renderer.js';
import {CombFilter, AverageFilter, lowPassFilter} from './Filtration.js'
import saveRecording from './Recording.js';
// console.log(d3.event);
const heartBeatValueElement = document.querySelector('#heart-beat-value');

// for production we should use wss, but for development ws is fine 
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
    console.log('We are connected!');

    // ws.send('Hey! How is it going?');
});


let filteredData = [], filteredLowPassData = [];

ws.addEventListener('message', (msg) => {
    const parsedData = JSON.parse(msg.data);
    // console.log(parsedData);
    let f1 = CombFilter(parsedData);
    let f2 = AverageFilter(f1);
    let f3 = lowPassFilter(f2);

    filteredData.push(...f2);
    filteredLowPassData.push(...f3);
    console.log(filteredLowPassData)
});


let index = 0;
let SLT = 1, ATP, ATN, lastRpeak = 0;
let RRCount = 0;
const SLTMIN = 1, ATPMIN = 100;

let lowPassButton = document.getElementById("low-pass-filter-icon");
let lowPass = false;

lowPassButton.addEventListener('click', () => {
  lowPass = !lowPass;
})  


const recordBtn = document.getElementById('rec-button');
let recording = false;
let recordingData = [];

recordBtn.addEventListener('click', () => {
  recording = !recording;
  if(!recording) saveRecording(recordingData);
  else recordingData = [];
})


let renderer = new D3Renderer();

let interval = setInterval(() => {
    // console.log("UPDATE")
    renderer.update(index, filteredData, filteredLowPassData, lowPass);

    if(recording) recordingData.push(Math.round(filteredData[index] * 1000) / 1000);

    
    //QRS DETECTION
    
    if (index >= 5) {
      let countPositive = 0;
      // console.log(countPositive);
      // Needed only in case of possible RPeak, but calculated here
      let ECGSlope = 0;
      let sumBckw = 0;
      let sumFwd = 0;
      for (let i = 1; i <= 5; i++) {
        const valbckw = filteredData[index - i];
        const valfwd = filteredData[index + i];
        const checkValue = (filteredData[index] - valbckw)*(filteredData[index]-valfwd);

        if (checkValue > 0) {
          countPositive++;
        }

        sumBckw += Math.abs(filteredData[index] - valbckw);
        sumFwd += Math.abs(filteredData[index] - valfwd);
        ECGSlope = sumBckw + sumFwd;
        
      }

      if(index - lastRpeak >= 60)
      {
        SLT = SLT - SLT / 128;
        ATP--;
        ATN++;
      }
        
      if (countPositive == 5) { // more conditions needed... use SLTValue (ECGSlope for current smaple) and more
      // detectedRPeaks.push({
      // name: 'RPeak',
      // valueR: data[index]
      // });
        // console.log('Possible RPeak detected...!');

        let maxPossibleRVal = Math.max(...filteredData.slice(index, index + 60).map(Math.abs));
        
        if(maxPossibleRVal === Math.abs(filteredData[index]))
        if(ECGSlope > SLT) {
          
          RRCount++;

          renderer.drawCircle(index % 1000, filteredData[index]);

          SLT = ECGSlope;
          if(filteredData[index] > 0)
            ATP = filteredData[index];
          else
            ATN = filteredData[index];
          lastRpeak = index;
        }
        else if(ECGSlope > SLT / 2 && filteredData[index] > 2 * ATP) {
          
          RRCount++;

          renderer.drawCircle(index % 1000, filteredData[index]);

          SLT = ECGSlope;
          if(filteredData[index] > 0)
            ATP = filteredData[index];
          else
            ATN = filteredData[index];
          lastRpeak = index;
        }
        else if(ECGSlope > SLT / 2 && filteredData[index] < 2 * ATN) {
          
          RRCount++;

          renderer.drawCircle(index % 1000, filteredData[index]);

          SLT = ECGSlope;
          if(filteredData[index] > 0)
            ATP = filteredData[index];
          else
            ATN = filteredData[index];
          lastRpeak = index;
        }

      if(SLT <= SLTMIN)
        SLT = ECGSlope;
    }
  }

  if(index % 1000 === 0) {
    const heartBeat = ((RRCount / 4) * 60);
    console.log(heartBeat);
    heartBeatValueElement.innerText = heartBeat;
    RRCount = 0;
  }
  if(index % 1000 === 0) 
    renderer.clearCircles();
  index++;
}, 4);