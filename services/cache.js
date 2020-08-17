const mongoose = require('mongoose');
const redis = require('redis');
const {promisify} = require('util');
const keys = require('../config/keys');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = promisify(client.get);
client.hget = promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cachedValue = await client.hget(this.hashKey, key);

    if (cachedValue) {
        const doc = JSON.parse(cachedValue);
        Array.isArray(doc)
            ? doc.map(e => new this.model(e))
            : new this.model(doc);
        return doc;
    }

    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}


module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
