/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');

const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
    return db.put(key, value)
        .then(() => true)
        .catch((err) => {
            console.log(`Block ${key} submission failed`, err);
            return false;
        });
}

// Get data from levelDB with key
function getLevelDBData(key) {
    return db.get(key)
        .then((value) => {
            console.log(`Value = ${value}`);
            return value;
        })
        .catch((err) => {
            console.log('Not found!', err);
            return null;
        });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    return new Promise((resolve, reject) => {
        db.createReadStream().on('data', function () {
            i += 1;
        }).on('error', function (err) {
            console.log('Unable to read data stream!', err);
            reject(err);
        }).on('close', function () {
            console.log(`Block #${i}`);
            resolve(addLevelDBData(i, value));
        });
    });
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


function theLoop(i) {
    setTimeout(function () {
        addDataToLevelDB('Testing data');
        if (--i) theLoop(i); // eslint-disable-line no-param-reassign
    }, 100);
}

module.exports = {
    addLevelDBData,
    getLevelDBData,
    addDataToLevelDB,
    theLoop,
};
