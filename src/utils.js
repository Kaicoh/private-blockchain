const bitcoinMessage = require('bitcoinjs-message');

const validateRequest = ({ message, address, signature }) => (
    bitcoinMessage.verify(message, address, signature)
);

module.exports = {
    validateRequest,
};
