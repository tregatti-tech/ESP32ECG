
const a = [-1.374, 0.5278];
const b = [0.0384, 0.0768, 0.0384];

function idx(i, n)
{
 return ((i % n) + n) % n;
}

const CombFilter = (incomingData) => {
    let filteredData = [];
    
    for(let index=0; index < incomingData.length; index++)
    {
        let D = 5, N = 17;
        let data1=NaN, suma = 0;
        for(let i = index - D * (N - 1) / 2; i <= index + D * (N - 1) / 2; i += D) {
          suma += +incomingData[idx(i, 1000)];
        }
        data1 = 255 - 128 - (+incomingData[index] - suma / N);
        filteredData.push(data1);

    };

    return filteredData;
}

const AverageFilter = (incomingData) => {
    let filteredData = [];
    for(let j=incomingData.length - 1000; j < incomingData.length - 5; j++)
    {
        let avg=0;
        for(let i=0; i < 5; i++) {
            avg += incomingData[i + j];
        }
        avg /= 5;
        filteredData.push(avg);
    }

    return filteredData;
}

// Incoming raw data is not really raw, it is filtered with the other filter
// lowPassFilteredData is data we already filtered after the button has been clicked
const lowPassFilter = (incomingRawData) => {
    let lowPassFilteredData = [];

    for(let j=0; j < 1000; j++)
    {
        let sumRaw = 0;
        let sumFiltered = 0;
        for (let i = 0; i <= 2; i++) {
            sumRaw += b[i]*incomingRawData[idx(j - i, incomingRawData.length)];
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

export {CombFilter, AverageFilter, lowPassFilter};
