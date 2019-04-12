const R = require('ramda');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const verifySignature = ({ message, address, signature }) => (
    bitcoinMessage.verify(message, address, signature)
);

const signMessage = ({ message, privateKey, compressed }) => (
    bitcoinMessage.sign(message, privateKey, compressed)
);

const generateRamdomKeyPair = bitcoin.ECPair.makeRandom;
const p2pkhAddress = keyPair => (
    bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address
);
const generateRamdomAddress = R.compose(
    p2pkhAddress,
    generateRamdomKeyPair,
);

const delay = (duration, value) => (
    new Promise((resolve) => {
        setTimeout(() => resolve(value), duration);
    })
);

module.exports = {
    verifySignature,
    signMessage,
    generateRamdomKeyPair,
    p2pkhAddress,
    generateRamdomAddress,
    delay,
};
