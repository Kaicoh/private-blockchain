/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const dbService = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block             |
|  ===============================================*/

class Block {
    constructor({
        hash = '',
        data = '',
        height = 0,
        time = new Date().getTime().toString().slice(0, -3),
        previousBlockHash = '',
    }) {
        this.hash = hash;
        this.height = height;
        this.data = data;
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

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain {
    static storeGenesisBlock() {
        const genesisBlock = new Block({ data: 'First block in the chain - Genesis block' });
        genesisBlock.resetHash();
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
            .then(() => this.getLastBlock())
            .then(({ height, hash }) => {
                newBlock.height = height + 1; // eslint-disable-line no-param-reassign
                newBlock.previousBlockHash = hash; // eslint-disable-line no-param-reassign
                newBlock.resetHash();
                return dbService.store(newBlock.height, newBlock);
            })
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
        return dbService.get(blockHeight).then(obj => new Block(obj));
    }

    getLastBlock() {
        return this.getBlockHeight().then(height => this.getBlock(height));
    }

    // validate block
    validateBlock(blockHeight) {
        return this.getBlock(blockHeight)
            .then((block) => {
                if (block.validateHash()) {
                    return true;
                }
                console.log(`Block #${blockHeight} invalid hash: ${block.hash} <> ${block.calculateHash()}`);
                return false;
            })
            .catch((err) => {
                console.log(`Failed to validate block #${blockHeight}`, err);
            });
    }

    // validate the hash chain
    validateHashChain(blockHeight) {
        if (blockHeight === 0) return Promise.resolve(true);

        return Promise.all([this.getBlock(blockHeight - 1), this.getBlock(blockHeight)])
            .then(([previousBlock, block]) => {
                if (previousBlock.hash === block.previousBlockHash) {
                    return true;
                }
                console.log('The chain of hashes is broken');
                console.log(`Block #${previousBlock.height} hash: ${previousBlock.hash}`);
                console.log(`Block #${block.height} previousBlockHash: ${block.previousBlockHash}`);
                return false;
            })
            .catch((err) => {
                console.log(`Failed to validate the link of blocks #${blockHeight}`, err);
            });
    }

    validateBlockAndHashChain(blockHeight) {
        return Promise.all(
            [this.validateBlock(blockHeight), this.validateHashChain(blockHeight)],
        ).then(([result1, result2]) => result1 && result2);
    }

    // Validate blockchain
    validateChain() {
        return this.getBlockHeight()
            .then(height => Array.from(Array(height).keys()))
            .then(heights => Promise.all(
                heights.map(height => this.validateBlockAndHashChain(height)),
            ))
            .then(results => results.every(result => result))
            .catch((err) => {
                console.log('Failed to validate chain', err);
            });
    }

    // for test purpose
    UNSAFE_modifyBlock(blockHeight, data = 'invalid data') { // eslint-disable-line camelcase
        return this.getBlock(blockHeight)
            .then((block) => {
                block.data = data; // eslint-disable-line no-param-reassign
                return dbService.store(blockHeight, block);
            });
    }
}

module.exports = {
    Block,
    Blockchain,
};
