'use strict';
const _ = require('lodash'),
    glob = require('glob'),
    crypto = require('crypto'),
    fs = require('fs'),
    slug = require('@sindresorhus/slugify'),
    shell = require('shelljs'),
    writeYml = require('write-yaml');

function match(patterns, excludes) {
    const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
    let output = [];
    if (_.isArray(patterns)) {
        patterns.forEach(function(e) {
            output = _.union(output, match(e, excludes));
        });
    } else if (_.isString(patterns)) {
        if (urlRegex.test(patterns)) {
            output.push(patterns);
        } else {
            var files = glob.sync(patterns);
            if (excludes) {
                files = files.map(function(file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }
    return output;
}

var md5 = function(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    },
    write = function(content, filePath) {
        var dir = filePath.split('/');
        dir.pop();
        shell.mkdir('-p', dir.join('/'));
        try {
            fs.writeFileSync(filePath, content);
        } catch (err) {
            console.log(err);
        }
    };

function cipher(input, password, algorithm) {
    algorithm = algorithm || 'aes192';
    const cipher = crypto.createCipher(algorithm, password);
    var encrypted = cipher.update(input, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decipher(input, password, algorithm) {
    algorithm = algorithm || 'aes192';
    const decipher = crypto.createDecipher(algorithm, password);
    var decrypted = decipher.update(input, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function aes192(input, password) {
    return cipher(input, password, 'aes192');
}

function aes256(input, password) {
    return cipher(input, password, 'aes-256-cbc');
}

function hash(input, algorithm) {
    algorithm = algorithm || 'sha256';
    const hash = crypto.createHash(algorithm);
    hash.update(input);
    return hash.digest('hex');
}
var base64 = {
    encode: function(e) {
        return new Buffer(e).toString('base64');
    },
    decode: function(e) {
        return new Buffer(e, 'base64').toString('utf8');
    }
};

function trimAll(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/(\r\n|\n|\r)/g, ' ').replace(/\s\s+/g, ' ').trim();
}

_.assign(module.exports, {
    match: match,
    cipher: cipher,
    decipher: decipher,
    aes192: aes192,
    aes256: aes256,
    hash: hash,
    base64: base64,
    trimAll: trimAll,
    slug: slug,
    md5: md5,
    write: write,
    writeYml: writeYml
});