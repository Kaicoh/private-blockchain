const { validateRequest } = require('./utils');

const TimeoutRequestsWindowTime = 5 * 60 * 1000;

class Mempool {
    constructor() {
        // MEMO: key: walletAddress, value: requestTimeStamp
        this.requests = new Map();
        // MEMO: verified addresses set
        this.validAddresses = new Set();
    }

    // add key(walletAddress), value(timeStamp) to requests Map and return requestObject.
    push(walletAddress) {
        // "If the user re-submits a request, the application will not add a new request."
        if (this.requests.has(walletAddress)) {
            return this.requestObject(walletAddress);
        }

        this.requests.set(walletAddress, new Date().getTime());

        // A key-value pair will be removed automatically, when it expires.
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

    requestTimeStamp(walletAddress) {
        if (!this.requests.has(walletAddress)) {
            throw new Error('the walletAddress is not registered');
        }
        return this.requests.get(walletAddress).toString().slice(0, -3);
    }

    message(walletAddress) {
        return `${walletAddress}:${this.requestTimeStamp(walletAddress)}:starRegistry`;
    }

    requestObject(walletAddress) {
        return {
            walletAddress,
            requestTimeStamp: this.requestTimeStamp(walletAddress),
            message: this.message(walletAddress),
            validationWindow: parseInt(TimeoutRequestsWindowTime / 1000, 10),
        };
    }

    validRequest(walletAddress, signature) {
        const validationResult = validateRequest({
            message: this.message(walletAddress),
            address: walletAddress,
            signature,
        });

        const validRequestObject = {
            registerStar: validationResult,
            status: {
                address: walletAddress,
                requestTimeStamp: this.requestTimeStamp(walletAddress),
                message: this.message(walletAddress),
                validationWindow: this.timeLeft(walletAddress),
                messageSignature: validationResult,
            },
        };

        if (validationResult) {
            this.requests.delete(walletAddress);
            this.validAddresses.add(walletAddress);
        }

        return validRequestObject;
    }

    isVerified(walletAddress) {
        return this.validAddresses.has(walletAddress);
    }

    removeValidAddress(walletAddress) {
        this.validAddresses.delete(walletAddress);
    }
}

module.exports = Mempool;
