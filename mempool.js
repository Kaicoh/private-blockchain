const TimeoutRequestsWindowTime = 5 * 60 * 1000;

class Mempool {
    constructor() {
        // key: walletAddress, value: requestTimeStamp
        this.requests = new Map();
    }

    // add key(walletAddress), value(timeStamp) to requests Map and return requestObject.
    push(walletAddress) {
        // "If the user re-submits a request, the application will not add a new request."
        if (this.requests.has(walletAddress)) {
            return this.requestObject(walletAddress);
        }

        this.requests.set(walletAddress, new Date().getTime());

        // key-value pair will be removed automatically, when they expire.
        setTimeout(() => {
            this.requests.delete(walletAddress);
        }, TimeoutRequestsWindowTime);

        return this.requestObject(walletAddress);
    }

    timeLeft(walletAddress) {
        if (this.requests.has(walletAddress)) {
            const timeElapse = new Date().getTime() - this.requests.get(walletAddress);
            const timeLeftMilliSec = TimeoutRequestsWindowTime - timeElapse;
            return parseInt(timeLeftMilliSec / 1000, 10);
        }
        return 0;
    }

    requestObject(walletAddress) {
        if (this.requests.has(walletAddress)) {
            const requestTimeStamp = this.requests.get(walletAddress).toString().slice(0, -3);
            return {
                walletAddress,
                requestTimeStamp,
                message: `${walletAddress}:${requestTimeStamp}:starRegistry`,
                validationWindow: parseInt(TimeoutRequestsWindowTime / 1000, 10),
            };
        }
        return null;
    }
}

module.exports = Mempool;
