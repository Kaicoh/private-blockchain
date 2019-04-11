const R = require('ramda');
const dbService = require('./dbService');
const Block = require('./block');

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain {
    static storeGenesisBlock() {
        const genesisBlock = new Block({ body: 'First block in the chain - Genesis block' });
        genesisBlock.resetHash();
        return dbService.store(0, genesisBlock);
    }

    constructor() {
        Blockchain.storeGenesisBlock();
    }

    getChain() {
        return this.getBlockHeights()
            .then(heights => Promise.all(
                heights.map(height => this.getBlock(height)),
            ));
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
            .then(() => newBlock)
            .catch((err) => {
                console.log('Failed to add block', err);
            });
    }

    // Get block height
    getBlockHeight() { // eslint-disable-line class-methods-use-this
        return dbService.getDataCount().then(num => num - 1);
    }

    getBlockHeights() {
        // return [0, 1, 2, ... , height ]
        return this.getBlockHeight().then(height => R.range(0, height + 1));
    }

    // get block
    getBlock(blockHeight) { // eslint-disable-line class-methods-use-this
        return dbService.get(blockHeight).then((obj) => {
            if (obj) {
                return new Block(obj);
            }
            return null;
        });
    }

    getBlockByHash(hash) { // eslint-disable-line class-methods-use-this
        return dbService.getByHash(hash).then((obj) => {
            if (obj) {
                return new Block(obj);
            }
            return null;
        });
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

    validateBlocks() {
        return this.getBlockHeights()
            .then(heights => Promise.all(
                heights.map(height => this.validateBlock(height)),
            ))
            .then(results => results.every(R.identity));
    }

    // compare block hash and previous block hash
    validateHashChain() {
        return this.getChain()
            .then(blocks => blocks.map((block, idx) => {
                if (idx === blocks.length - 1) {
                    return true;
                }

                if (block.hash === blocks[idx + 1].previousBlockHash) {
                    return true;
                }

                console.log('Invalid hash chain');
                console.log(`Block #${idx} hash: ${block.hash}`);
                console.log(`Block #${idx + 1} previousBlockHash: ${blocks[idx + 1].previousBlockHash}`);
                return false;
            }))
            .then(results => results.every(R.identity));
    }

    // Validate blockchain
    validateChain() {
        return Promise.all([this.validateBlocks(), this.validateHashChain()])
            .then(([result1, result2]) => result1 && result2)
            .catch((err) => {
                console.log('Failed to validate chain', err);
            });
    }

    // for test purpose
    UNSAFE_modifyBlock(blockHeight, data = 'invalid data') { // eslint-disable-line camelcase
        return this.getBlock(blockHeight)
            .then((block) => {
                block.hash = data; // eslint-disable-line no-param-reassign
                return dbService.store(blockHeight, block);
            });
    }
}

module.exports = Blockchain;
