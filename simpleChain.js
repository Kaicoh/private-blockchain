/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const dbService = require('./levelSandbox'); // eslint-disable-line no-unused-vars

/* ===== Block Class ==============================
|  Class with a constructor for block             |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = '';
        this.height = 0;
        this.body = data;
        this.time = 0;
        this.previousBlockHash = '';
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain { // eslint-disable-line no-unused-vars
    constructor() {
        this.chain = [];
        this.addBlock(new Block('First block in the chain - Genesis block'));
    }

    // Add new block
    addBlock(newBlock) {
        /* eslint-disable no-param-reassign */

        // Block height
        newBlock.height = this.chain.length;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (this.chain.length > 0) {
            newBlock.previousBlockHash = this.chain[this.chain.length - 1].hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        /* eslint-enable no-param-reassign */
        // Adding block object to chain
        this.chain.push(newBlock);
    }

    // Get block height
    getBlockHeight() {
        return this.chain.length - 1;
    }

    // get block
    getBlock(blockHeight) {
        // return object as a single string
        return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    }

    // validate block
    validateBlock(blockHeight) {
        // get block object
        const block = this.getBlock(blockHeight);
        // get block hash
        const blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        const validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            return true;
        }
        console.log(`Block #${blockHeight} invalid hash:\n${blockHash} <> ${validBlockHash}`);
        return false;
    }

    // Validate blockchain
    validateChain() {
        const errorLog = [];
        for (let i = 0; i < this.chain.length - 1; i++) {
            // validate block
            if (!this.validateBlock(i))errorLog.push(i);
            // compare blocks hash link
            const blockHash = this.chain[i].hash;
            const previousHash = this.chain[i + 1].previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }
        if (errorLog.length > 0) {
            console.log(`Block errors = ${errorLog.length}`);
            console.log(`Blocks: ${errorLog}`);
        } else {
            console.log('No errors detected');
        }
    }
}
