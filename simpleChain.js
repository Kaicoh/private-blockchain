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

    setProps({
        height = 0,
        time = new Date().getTime().toString().slice(0, -3),
        previousBlockHash = '',
    } = {}) {
        this.height = height;
        this.time = time;
        this.previousBlockHash = previousBlockHash;
        this.hash = SHA256(JSON.stringify(this)).toString();
        return this;
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain { // eslint-disable-line no-unused-vars
    static storeGenesisBlock() {
        const genesisBlock = new Block('First block in the chain - Genesis block').setProps();
        return dbService.store(0, genesisBlock);
    }

    constructor() {
        Blockchain.storeGenesisBlock();
    }

    // Add new block
    addBlock(newBlock) {
        return this.getBlock(0)
            .then((block) => {
                if (block) return null;
                return Blockchain.storeGenesisBlock();
            })
            .then(() => this.getLastBlock()) // NOTE: Using arrow function to bind "this"
            .then(({ height, hash }) => dbService.store(
                height + 1,
                newBlock.setProps({ height: height + 1, previousBlockHash: hash }),
            ))
            .catch((err) => {
                console.log('Failed to add block', err);
            });
    }

    // Get block height
    getBlockHeight() { // eslint-disable-line class-methods-use-this
        return dbService.getDataCount().then(num => num - 1);
    }

    // get block
    getBlock(blockHeight) { // eslint-disable-line class-methods-use-this
        return dbService.get(blockHeight);
    }

    // get last block
    getLastBlock() {
        return this.getBlockHeight().then(this.getBlock);
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

module.exports = {
    Block,
    Blockchain,
};
