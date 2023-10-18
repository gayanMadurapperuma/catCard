const util = require('util');
const { writeFile } = require('fs');
const { join } = require('path');
const axios = require('axios');
const blend = require('@mapbox/blend');
const argv = require('minimist')(process.argv.slice(2));

const blendPromise = util.promisify(blend);
const writeFilePromise = util.promisify(writeFile);

console.log('argv', argv);
console.log('argv', argv.greeting);

const {
    greeting = 'Hello',
    who = 'You',
    width = 400,
    height = 500,
    color = 'Pink',
    size = 100,
} = argv;

const instance = axios.create({
    baseURL: 'https://cataas.com/cat/says/',
    responseEncoding: 'binary'
});

const catCard = async () => {
    try {
        const [firstImage, secondImage] = await Promise.all([
            instance.get(`${greeting}?width=${width}&height=${height}&color${color}&s=${size}`),
            instance.get(`${who}?width=${width}&height=${height}&color${color}&s=${size}`),
        ]);
        const result = await blendPromise([
            { buffer: Buffer.from(firstImage.data, 'binary'), x: 0, y: 0 }, 
            { buffer: Buffer.from(secondImage.data, 'binary'), x: width, y: 0 }], 
            { width: width * 2, height: height, format: 'jpeg'});
        await writeFilePromise(join(process.cwd(), `/cat-card.jpg`), result, 'binary');
        console.log('The file was saved!');
    } catch (error) {
        console.error(error);
    }
}

catCard();