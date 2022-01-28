const a = [-1.374, 0.5278];
const b = [0.0384, 0.0768, 0.0384];

function idx(i, n)
{
 return ((i % n) + n) % n;
}

// Incoming raw data is not really raw, it is filtered with the other filter
// lowPassFilteredData is data we already filtered after the button has been clicked
const lowPassFilter = (incomingRawData) => {
    let lowPassFilteredData = [];
    let index = incomingRawData.length - 1000;

    for(let j=0; j < 1000; j++)
    {
        let sumRaw = 0;
        let sumFiltered = 0;
        for (let i = 0; i <= 2; i++) {
            sumRaw += b[i]*incomingRawData[idx(index + j - i, incomingRawData.length)];
        }
        for (let i = 0; i <= 1; i++) {
            sumFiltered += a[i]*incomingRawData[idx(j - i - 1, incomingRawData.length)];
        }
        const filteredSample = sumRaw - sumFiltered;
        lowPassFilteredData.push(filteredSample);
    }
    // console.log(lowPassFilteredData);
    return lowPassFilteredData;
};

export default lowPassFilter;