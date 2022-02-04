import D3Renderer from './D3Renderer.js';
import {CombFilter, AverageFilter, lowPassFilter} from './Filtration.js'
import saveRecording from './Recording.js';
import toggleViewSection from './toggleViewSection.js';
import QRSDetector from './QRSDetector.js';

// console.log(d3.event);
const heartBeatValueElement = document.querySelector('#heart-beat-value');

// for production we should use wss, but for development ws is fine 
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
    console.log('We are connected!');

    // ws.send('Hey! How is it going?');
});

let filteredData = [], filteredLowPassData = [], RRIntervals = [];

ws.addEventListener('message', (msg) => {
    const parsedData = JSON.parse(msg.data);
    // console.log(parsedData);
    let f1 = CombFilter(parsedData);
    let f2 = AverageFilter(f1);
    let f3 = lowPassFilter(f2);

    filteredData.push(...f2);
    filteredLowPassData.push(...f3);
    // console.log(filteredLowPassData)
});

let index = 0;

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

const fileSelector = document.getElementById('open-rec-button');
let recordingInput = [];
let live = true;
let numberOfFileLoaded = 0;

fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;
  
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    recordingInput = JSON.parse(event.target.result);
    live = false;
    clearInterval(interval);
    renderer.clearAll();

    numberOfFileLoaded++;
    if (numberOfFileLoaded === 1) {
      toggleViewSection();
    }

    renderer.drawPreviousData(recordingInput);

    handleQRSDetection(recordingInput);
  });

  reader.readAsText(fileList[0]);
});

let renderer = new D3Renderer();
// renderer.setScale(1);

let qRsDetector = new QRSDetector(renderer);

let interval = setInterval(() => {
  // console.log("UPDATE")
  renderer.update(index, filteredData, filteredLowPassData, lowPass);
  qRsDetector.update(filteredData, index);

  if(recording) recordingData.push(Math.round(filteredData[index] * 1000) / 1000);

  if(index % 1000 === 0) {
    const heartBeat = ((qRsDetector.RRCount / 4) * 60);
    // console.log(heartBeat);
    heartBeatValueElement.innerText = heartBeat;
    qRsDetector.RRCount = 0;
  }
  if(index % 1000 === 0) 
    renderer.clearCircles();
  index++;
}, 4);

const changeViewElement = document.querySelector('#change-view-dropdown');
changeViewElement.addEventListener('change', () => {
  const selectedView = changeViewElement.value;
  if (selectedView === 'small') {
    renderer.setScale(1);
    renderer.clearAll();
    renderer.drawPreviousData(recordingInput);
  } 
  else if (selectedView === 'big') {
    renderer.setScale(2);
    renderer.clearAll();
    renderer.drawPreviousData(recordingInput);
  } 
  else if (selectedView === 'poincare') {
    renderer.clearAll();

    const RRLength = qRsDetector.RRIntervals.length;

    renderer.drawPoincareAxis();
    for (let i = 0; i < RRLength - 1; i++) {
      renderer.drawPoincareDots(qRsDetector.RRIntervals[i], qRsDetector.RRIntervals[i + 1]);
    }
  }
})

const handleQRSDetection = (input) => {
    qRsDetector.clearAll();
    for (let i = 0; i < input.length; i++) {
      qRsDetector.update(input, i);
    }
    console.log(qRsDetector.RRIntervals);
}