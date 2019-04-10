const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const {
    signMessage,
    generateRamdomKeyPair,
    p2pkhAddress,
} = require('../src/utils');

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
        keyPair = generateRamdomKeyPair();
        address = p2pkhAddress(keyPair);
    });

    describe('POST /requestValidation', () => {
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

    describe('POST /message-signature/validate', () => {
        let response;

        before(async () => {
            const signature = signMessage({
                message,
                privateKey: keyPair.privateKey,
                compressed: keyPair.compressed,
            });
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

    describe('POST /block', () => {
        let response;
        const star = {
            dec: '68° 52\' 56.9',
            ra: '16h 29m 1.0s',
            story: 'Found star using https://www.google.com/sky/',
        };

        before(async () => {
            response = await chai.request(app)
                .post('/block')
                .send({ address, star });
        });

        it('returns http status 201', () => {
            expect(response).to.have.status(201);
        });

        describe('returns an object', () => {
            let body;

            before(() => {
                body = response.body; // eslint-disable-line prefer-destructuring
            });

            it('has hash property', () => {
                expect(body).to.have.property('hash').and.match(/\w{64}/);
            });

            it('has height property', () => {
                expect(body).to.have.property('height').that.is.a('number');
            });

            it('has body.address property', () => {
                expect(body).to.have.nested.property('body.address', address);
            });

            it('has body.star.dec property', () => {
                expect(body).to.have.nested.property('body.star.dec', star.dec);
            });

            it('has body.star.ra property', () => {
                expect(body).to.have.nested.property('body.star.ra', star.ra);
            });

            it('has body.star.story property', () => {
                const encodedStory = Buffer.from(star.story).toString('hex');
                expect(body).to.have.nested.property('body.star.story', encodedStory);
            });

            it('has time property', () => {
                expect(body).to.have.property('time').and.match(/\d{10}/);
            });

            it('has previousBlockHash property', () => {
                expect(body).to.have.property('previousBlockHash').and.match(/\w{64}/);
            });
        });
    });
});
