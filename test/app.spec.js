const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const {
    signMessage,
    generateRamdomKeyPair,
    p2pkhAddress,
    generateRamdomAddress,
    delay,
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

// Test registering star process
describe('registering star', () => {
    let keyPair;
    let address;
    let message;
    let height;
    let hash;

    const star = {
        dec: '68° 52\' 56.9',
        ra: '16h 29m 1.0s',
        story: 'Found star using https://www.google.com/sky/',
    };

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

                // store value to use in the following steps.
                hash = body.hash; // eslint-disable-line prefer-destructuring
            });

            it('has height property', () => {
                expect(body).to.have.property('height').that.is.a('number');

                // store value to use in the following steps.
                height = body.height; // eslint-disable-line prefer-destructuring
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

            it('has body.star.storyDecoded property', () => {
                expect(body).to.have.nested.property('body.star.storyDecoded', star.story);
            });

            it('has time property', () => {
                expect(body).to.have.property('time').and.match(/\d{10}/);
            });

            it('has previousBlockHash property', () => {
                expect(body).to.have.property('previousBlockHash').and.match(/\w{64}/);
            });
        });
    });

    describe('GET /block/:blockHeight', () => {
        let response;

        before(async () => {
            response = await chai.request(app)
                .get(`/block/${height}`);
        });

        it('returns http status 200', () => {
            expect(response).to.have.status(200);
        });

        describe('returns an object', () => {
            let body;

            before(() => {
                body = response.body; // eslint-disable-line prefer-destructuring
            });

            it('has hash property', () => {
                expect(body).to.have.property('hash', hash);
            });

            it('has height property', () => {
                expect(body).to.have.property('height', height);
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

            it('has body.star.storyDecoded property', () => {
                expect(body).to.have.nested.property('body.star.storyDecoded', star.story);
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


describe('get stars', () => {
    let hash;
    const address1 = generateRamdomAddress();
    const address2 = generateRamdomAddress();

    const star1 = {
        dec: '68° 52\' 56.9',
        ra: '16h 29m 1.0s',
        story: 'Found star using https://www.google.com/sky/',
    };
    const star2 = {
        dec: '-26° 29\' 24.9',
        ra: '16h 29m 1.0s',
        story: 'This is a second dummy data',
    };
    const star3 = {
        dec: '-27° 14\' 8.2',
        ra: '17h 22m 13.1s',
        story: 'This is a third dummy data',
    };

    // create blocks for test
    before(async () => {
        const response = await chai.request(app).post('/dummyBlock').send({ address: address1, star: star1 });
        hash = response.body.hash; // eslint-disable-line prefer-destructuring

        await chai.request(app).post('/dummyBlock').send({ address: address2, star: star2 });
        await chai.request(app).post('/dummyBlock').send({ address: address2, star: star3 });
    });

    describe('GET /stars/hash:blockHash', () => {
        let response;

        before(async () => {
            response = await chai.request(app)
                .get(`/stars/hash:${hash}`);
        });

        it('returns http status 200', () => {
            expect(response).to.have.status(200);
        });

        describe('returns an object', () => {
            let body;

            before(() => {
                body = response.body; // eslint-disable-line prefer-destructuring
            });

            it('has hash property', () => {
                expect(body).to.have.property('hash', hash);
            });

            it('has height property', () => {
                expect(body).to.have.property('height').that.is.a('number');
            });

            it('has body.address property', () => {
                expect(body).to.have.nested.property('body.address', address1);
            });

            it('has body.star.dec property', () => {
                expect(body).to.have.nested.property('body.star.dec', star1.dec);
            });

            it('has body.star.ra property', () => {
                expect(body).to.have.nested.property('body.star.ra', star1.ra);
            });

            it('has body.star.story property', () => {
                const encodedStory = Buffer.from(star1.story).toString('hex');
                expect(body).to.have.nested.property('body.star.story', encodedStory);
            });

            it('has body.star.storyDecoded property', () => {
                expect(body).to.have.nested.property('body.star.storyDecoded', star1.story);
            });

            it('has time property', () => {
                expect(body).to.have.property('time').and.match(/\d{10}/);
            });

            it('has previousBlockHash property', () => {
                expect(body).to.have.property('previousBlockHash').and.match(/\w{64}/);
            });
        });
    });

    describe('GET /stars/address:walletAddress', () => {
        let response;

        before(async () => {
            response = await chai.request(app)
                .get(`/stars/address:${address2}`);
        });

        it('returns http status 200', () => {
            expect(response).to.have.status(200);
        });

        describe('returns an array', () => {
            it('of collect length', () => {
                expect(response.body).to.be.an('array').and.have.lengthOf(2);
            });

            it('contains blocks which have all same body.address property', () => {
                response.body.forEach((block) => {
                    expect(block).to.have.nested.property('body.address', address2);
                });
            });

            it('contains blocks which have all have body.star property', () => {
                expect(response.body[0]).to.have.nested.property('body.star')
                    .and.deep.equal({
                        ...star2,
                        story: Buffer.from(star2.story).toString('hex'),
                        storyDecoded: star2.story,
                    });

                expect(response.body[1]).to.have.nested.property('body.star')
                    .and.deep.equal({
                        ...star3,
                        story: Buffer.from(star3.story).toString('hex'),
                        storyDecoded: star3.story,
                    });
            });
        });
    });
});

// Other specifications
describe('POST /requestValidation', () => {
    // spec:
    // When re-submitting within validation window,
    // the validation window should reduce until it expires.
    const address = generateRamdomAddress();

    before(async () => {
        await chai.request(app).post('/requestValidation').send({ address });
    });

    it('returns an object whose validationWindow is reduced', async () => {
        await delay(1000);
        const { body: { validationWindow } } = await chai
            .request(app).post('/requestValidation').send({ address });
        expect(validationWindow).to.be.below(300);
    });
});
