/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const path = require('path');
const level = require('level');

const chainDB = path.join(__dirname, '../chaindata');
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
    return db.put(key, JSON.stringify(value))
        .then(() => true)
        .catch((err) => {
            console.log(`Block ${key} submission failed`, err);
            return false;
        });
}

// Get data from levelDB with key
function getLevelDBData(key) {
    return db.get(key)
        .then(JSON.parse)
        .catch((err) => {
            console.log('Not found!', err);
            return null;
        });
}

function getDataCount() {
    let i = 0;
    return new Promise((resolve, reject) => {
        db.createReadStream().on('data', function () {
            i += 1;
        }).on('error', function (err) {
            console.log('Unable to read data stream!', err);
            reject(err);
        }).on('close', function () {
            resolve(i);
        });
    });
}

function getDataByHash(hash) {
    let block = null;
    return new Promise((resolve, reject) => {
        db.createReadStream()
            .on('data', function (data) {
                const object = JSON.parse(data.value);
                if (object.hash === hash) {
                    block = object;
                }
            })
            .on('error', function (err) {
                console.log('Unable to read data stream!', err);
                reject(err);
            })
            .on('close', function () {
                resolve(block);
            });
    });
}

module.exports = {
    store: addLevelDBData,
    get: getLevelDBData,
    getDataCount,
    getByHash: getDataByHash,
};
