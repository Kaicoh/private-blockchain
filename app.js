const express = require('express');
const bodyParser = require('body-parser');
const Block = require('./src/block');
const Blockchain = require('./src/blockchain');
const Mempool = require('./src/mempool');

const app = express();
const port = 8000;

const blockchain = new Blockchain();
const mempool = new Mempool();

app.use(bodyParser.json());

app.post('/requestValidation', (req, res) => {
    const walletAddress = req.body.address;
    if (walletAddress) {
        const requestObject = mempool.push(walletAddress);
        return res.json(requestObject);
    }
    return res.status(400).send('Data payload is required. And it must have "address" property.');
});

app.post('/message-signature/validate', (req, res) => {
    const { address, signature } = req.body;
    if (address && signature) {
        // check if the address is in the mempool and not timeout.
        if (mempool.timeLeft(address) <= 0) {
            return res.status(400).send('Timeout or your address is not registered.');
        }

        // validate signature and return validRequest object.
        const validRequest = mempool.validRequest(address, signature);
        return res.json(validRequest);
    }
    return res.status(400).send('Data payload is required. And it must have "address" and "signature" property.');
});

app.get('/block/:blockHeight', async (req, res) => {
    const blockHeight = parseInt(req.params.blockHeight, 10);
    const block = await blockchain.getBlock(blockHeight);
    return block ? res.json(block.decoded()) : res.sendStatus(404);
});

app.post('/block', async (req, res) => {
    const { address, star } = req.body;
    if (address && star) {
        if (mempool.isVerified(address)) {
            const block = await blockchain.addBlock(new Block({
                body: {
                    address,
                    star: {
                        ...star,
                        story: Buffer.from(star.story).toString('hex'),
                    },
                },
            }));

            // A user can create only one block at a time.
            // To register another block, he/she needs to post request from the beginning.
            // POST /requestValidation => POST /message-signature/validate ....
            mempool.removeValidAddress(address);
            return res.status(201).json(block.decoded());
        }

        return res.status(400).send('Invalid address.');
    }
    return res.status(400).send('Data payload is required. And it must have "address" and "star" property.');
});

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});

// Exports for test
module.exports = app;
