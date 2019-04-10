const chai = require('chai');
const chaiHttp = require('chai-http');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const app = require('../app');

chai.use(chaiHttp);

const { expect } = chai;

describe('get genesis block', () => {
    let response;

    beforeEach(async () => {
        response = await chai.request(app).get('/block/0');
    });

    it('returns http status 200', () => {
        expect(response).to.have.status(200);
    });
});

describe('notary service', () => {
    let keyPair;
    let address;
    let message;

    before(() => {
        keyPair = bitcoin.ECPair.makeRandom();
        // eslint-disable-next-line prefer-destructuring
        address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey }).address;
    });

    describe('/requestValidation', () => {
        let response;

        before(async () => {
            response = await chai.request(app)
                .post('/requestValidation')
                .send({ address });
        });

        it('returns http status 200', () => {
            expect(response).to.have.status(200);
        });

        describe('returns an object', () => {
            let body;

            before(() => {
                body = response.body; // eslint-disable-line prefer-destructuring
            });

            it('has walletAddress property', () => {
                expect(body).to.have.property('walletAddress', address);
            });

            it('has requestTimeStamp property', () => {
                expect(body).to.have.property('requestTimeStamp').and.match(/\d{10}/);
            });

            it('has message property', () => {
                const regExp = new RegExp(`${address}:\\d{10}:starRegistry`);
                expect(body).to.have.property('message').and.match(regExp);

                // store value to use in the following steps.
                message = body.message; // eslint-disable-line prefer-destructuring
            });

            it('has validationWindow property', () => {
                expect(body).to.have.property('validationWindow', 300);
            });
        });
    });

    describe('/message-signature/validate', () => {
        let response;

        before(async () => {
            const signature = bitcoinMessage.sign(message, keyPair.privateKey, keyPair.compressed);
            response = await chai.request(app)
                .post('/message-signature/validate')
                .send({ address, signature });
        });

        it('returns http status 200', () => {
            expect(response).to.have.status(200);
        });

        describe('returns an object', () => {
            let body;

            before(() => {
                body = response.body; // eslint-disable-line prefer-destructuring
            });

            it('has registerStar property', () => {
                expect(body).to.have.property('registerStar', true);
            });

            it('has status.address property', () => {
                expect(body).to.have.nested.property('status.address', address);
            });

            it('has status.requestTimeStamp property', () => {
                expect(body).to.have.nested.property('status.requestTimeStamp').and.match(/\d{10}/);
            });

            it('has status.message property', () => {
                const regExp = new RegExp(`${address}:\\d{10}:starRegistry`);
                expect(body).to.have.nested.property('status.message').and.match(regExp);
            });

            it('has status.validationWindow property', () => {
                expect(body).to.have.nested.property('status.validationWindow').and.match(/\d+/);
            });

            it('has status.messageSignature property', () => {
                expect(body).to.have.nested.property('status.messageSignature', true);
            });
        });
    });
});
