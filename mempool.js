const TimeoutRequestsWindowTime = 5 * 60 * 1000;

class Mempool {
    constructor() {
        // key: walletAddress, value: requestTimeStamp
        this.requests = new Map();
    }

    // add key(walletAddress), value(timeStamp) to requests Map and return message.
    push(walletAddress) {
        // "If the user re-submits a request, the application will not add a new request."
        if (this.requests.has(walletAddress)) {
            return this.message(walletAddress);
        }

        this.requests.set(walletAddress, new Date().getTime());

        // key-value pair will be removed automatically, when they expire.
        setTimeout(() => {
            this.requests.delete(walletAddress);
        }, TimeoutRequestsWindowTime);

        return this.message(walletAddress);
    }

    timeLeft(walletAddress) {
        if (this.requests.has(walletAddress)) {
            const timeElapse = new Date().getTime() - this.requests.get(walletAddress);
            const timeLeftMilliSec = TimeoutRequestsWindowTime - timeElapse;
            return parseInt(timeLeftMilliSec / 1000, 10);
        }
        return 0;
    }

    message(walletAddress) {
        if (this.requests.has(walletAddress)) {
            const timeStamp = this.requests.get(walletAddress).toString().slice(0, -3);
            return `${walletAddress}:${timeStamp}:starRegistry`;
        }
        return '';
    }
}

module.exports = Mempool;
