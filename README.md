# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

## Testing

Open a terminal and run this script
```
npm test
```

And the following steps start.

1: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```

2: Generate 10 blocks using a for loop
```
for (let i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```

3: Validate blockchain
```
blockchain.validateChain();
```

4: Induce errors by changing block data
```
const inducedErrorBlocks = [2, 4, 7];
inducedErrorBlocks.forEach(async (num) => {
    await blockchain.UNSAFE_modifyBlock(num, 'induced chain error');
});
```

5: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
