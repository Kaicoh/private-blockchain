const express = require('express');
const { Blockchain } = require('./simpleChain');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.get('/block/:blockHeight', async (req, res) => {
    const blockHeight = parseInt(req.params.blockHeight, 10);
    const block = await blockchain.getBlock(blockHeight);
    return block ? res.json(block) : res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});
