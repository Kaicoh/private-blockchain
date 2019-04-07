const { Block, Blockchain } = require('./simpleChain');

async function test() {
    const blockchain = new Blockchain();

    for (let i = 0; i <= 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        await blockchain.addBlock(new Block({ data: `test data ${i}` }));
    }

    const firstResult = await blockchain.validateChain();
    console.log('validate chain 1:', firstResult);

    const inducedErrorBlocks = [2, 4, 7];
    inducedErrorBlocks.forEach(async (num) => {
        await blockchain.UNSAFE_modifyBlock(num, 'induced chain error');
    });

    const secondResult = await blockchain.validateChain();
    console.log('validate chain 2:', secondResult);
}

test();
