'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
var targz = require('targz');

const metadata = require('../services/metadata');
const log = require('../services/log');
const logger = log.logger.getLogger('error');

module.exports = {

    async cleanPreviousContent() {
        const previousContentPath = path.resolve(__dirname, '..', 'content', 'current');

        fs.readdir(previousContentPath, (err, files) => {
            if (err) logger.error(err);
            for (let file of files) {
                fs.unlink(path.join(previousContentPath, file), (err) => {
                    if(err) logger.error(err);
                });
            }
        }); 
        console.log('> [movie-bot] Previous content removed.');
    },

    async compressContent() {
        setUpStoredContentDirectory();
        const content = metadata.load();
        const input = fs.readdirSync(path.resolve(__dirname, '..', 'content', 'current'));
        const output = fs.createWriteStream(path.resolve(__dirname, '..', 'content', 'stored', `${content.id}.tar.gz`));
        const archive = archiver('tar', {
            gzip: true,
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', () => {
            const formattedBytes = formatBytes(archive.pointer());
            console.log(`> [movie-bot] Compressing done. Content successfully stored (${formattedBytes} bytes).`);
        });

        output.on('end', () => {
            console.log('Data has been drained');
        });

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
              console.log('Directory Warning: ', err);
            } else {
              logger.error(err);
            }
        });

        archive.on('error', err => {
            logger.error(err);
        });

        archive.pipe(output);

        input.map(filename => {
            const fileContent = fs.createReadStream(path.resolve(__dirname, '..', 'content', 'current', `${filename}`));
            archive.append(fileContent, { name: filename });
        });

        archive.finalize();
    },

    async decompressContent() { 
        const content = metadata.load();
        targz.decompress({
            src: path.resolve(__dirname, '..', 'content', 'stored', `${content.id}.tar.gz`),
            dest: path.resolve(__dirname, '..', 'content', 'current')
        }, err => {
            if (err) {
                logger.error(err);
            } else {
                console.log('> [movie-bot] Decompressing done. Content succesfully recovered.');
            }
        });
    },

    async isContentStored() {
        const content = metadata.load();
        const input = fs.readdirSync(path.resolve(__dirname, '..', 'content', 'stored'));
        
        return input.some(filename => {
            if(filename == `${content.id}.tar.gz`) {
                console.log('> [movie-bot] The content has been previously stored.');
                return true;
            }
        });
    }
}

function setUpStoredContentDirectory() {
    try {
        fs.mkdirSync(path.resolve(__dirname, '..', 'content', 'stored'));
    } catch (error) {
        if (error.code != 'EEXIST') {
          console.error("Error setting up the stored content directory:: ", error);
          process.exit(1);
        }
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const base = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(base));

    return parseFloat((bytes / Math.pow(base, i)).toFixed(dm)) + ' ' + sizes[i];
}
