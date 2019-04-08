const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./simpleChain');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:blockHeight', async (req, res) => {
    const blockHeight = parseInt(req.params.blockHeight, 10);
    const block = await blockchain.getBlock(blockHeight);
    return block ? res.json(block) : res.sendStatus(404);
});

app.post('/block', async (req, res) => {
    const data = req.body.body;
    if (data) {
        const block = await blockchain.addBlock(new Block({ data }));
        return res.status(201).json(block);
    }
    return res.status(400).send('Data payload is required. And it must have "body" property.');
});

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});
