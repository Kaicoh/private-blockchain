const { Block, Blockchain } = require('./simpleChain');

async function test() {
    const blockchain = new Blockchain();

    for (let i = 0; i <= 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        await blockchain.addBlock(new Block({ data: `test data ${i}` }));
    }

    const firstResult = await blockchain.validateChain();
    console.log('###################################');
    console.log(`# validation result #1: ${firstResult ? 'success🎉' : 'failure❌'} #`);
    console.log('###################################');
    console.log('');

    const inducedErrorBlocks = [2, 4, 7];
    inducedErrorBlocks.forEach(async (num) => {
        await blockchain.UNSAFE_modifyBlock(num, 'induced chain error');
    });

    const secondResult = await blockchain.validateChain();
    console.log('');
    console.log('###################################');
    console.log(`# validation result #2: ${secondResult ? 'success🎉' : 'failure❌'} #`);
    console.log('###################################');
}

test();
