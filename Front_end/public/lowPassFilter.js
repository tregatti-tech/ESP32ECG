const a = [-1.374, 0.5278];
const b = [0.0384, 0.0768, 0.0384];

// Incoming raw data is not really raw, it is filtered with the other filter
// lowPassFilteredData is data we already filtered after the button has been clicked
const lowPassFilter = (incomingRawData, lowPassFilteredData, currSampleIdx) => {
    const sumRaw = 0;
    const sumFiltered = 0;
    for (let i = 0; i <= 2; i++) {
        sumRaw += b[i]*incomingRawData[currSampleIdx - i];
    }
    for (let i = 0; i <= 1; i++) {
        sumFiltered += a[i]*lowPassFilteredData[index - i - 1];
    }
    const filteredSample = sumRaw - sumFiltered;
    lowPassFilteredData.push(filteredSample); // ???
    return filteredSample;
};

export default lowPassFilter;