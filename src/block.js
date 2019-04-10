/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ==============================
|  Class with a constructor for block             |
|  ===============================================*/

class Block {
    constructor({
        hash = '',
        body = '',
        height = 0,
        time = new Date().getTime().toString().slice(0, -3),
        previousBlockHash = '',
    }) {
        this.hash = hash;
        this.height = height;
        this.body = body;
        this.time = time;
        this.previousBlockHash = previousBlockHash;
    }

    resetHash() {
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const currentHash = this.hash;
        // NOTE: To calculate correct value. we need to clear the hash property.
        this.hash = '';
        const calculatedValue = SHA256(JSON.stringify(this)).toString();
        this.hash = currentHash;
        return calculatedValue;
    }

    validateHash() {
        return this.hash === this.calculateHash();
    }
}

module.exports = Block;
