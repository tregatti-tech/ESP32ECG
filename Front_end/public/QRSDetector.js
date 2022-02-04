const SLTMIN = 1
const ATPMAX = 100;

class QRSDetector {
    constructor(renderer) {
        this.renderer = renderer;
        this.clearAll();
    }

    detectedRPeak(x, y, ECGSlope) {
        this.RRCount++;

        this.renderer.drawCircle(x % 1000, y);

        this.SLT = ECGSlope;
        if(y > 0)
            this.ATP = y;
        else
            this.ATN = y;
        
        const RRInterval = (x - this.lastRpeak) * 4; // this gives us RRInterval length (in ms)
        this.RRIntervals.push(RRInterval);

        this.lastRpeak = x;
    }

    update(filteredData, index) {   
        //QRS DETECTION
        if (index >= 5) {
            let countPositive = 0;
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

            if(index - this.lastRpeak >= 60)
            {
                this.SLT = this.SLT - this.SLT / 128;
                this.ATP--;
                this.ATN++;
            }
                
            if (countPositive == 5) { 
                let maxPossibleRVal = Math.max(...filteredData.slice(index, index + 60).map(Math.abs));
                
                if(Math.abs(maxPossibleRVal - Math.abs(filteredData[index])) < 2)
                if(ECGSlope > this.SLT) {
                    this.detectedRPeak(index, filteredData[index], ECGSlope);
                }
                else if(ECGSlope > this.SLT / 2 && filteredData[index] > 2 * this.ATP) {
                    this.detectedRPeak(index, filteredData[index], ECGSlope);
                }
                else if(ECGSlope > this.SLT / 2 && filteredData[index] < 2 * this.ATN) {
                    this.detectedRPeak(index, filteredData[index], ECGSlope);
                }

                if(this.SLT <= SLTMIN)
                    this.SLT = ECGSlope;

                if(this.SLT >= ATPMAX)
                    this.SLT = ECGSlope;
            }
        }
    }

    clearAll() {
        this.RRIntervals = [];
        this.SLT = 1;
        this.ATP = 0;
        this.ATN = 0;
        this.lastRpeak = 0;
        this.RRCount = 0;
    }
};

export default QRSDetector