'use strict';

const inquirer = require('inquirer');
const ngrokURL = require('../config/config').NGROK_TUNNEL_URL;
const axios = require('axios');

const api = axios.create({
    baseURL: ngrokURL,
});

module.exports = {
    async main() {
        console.log('> [movie-bot] Starting chat...');
        console.log('> --------------------');
        let response = await chat();
        await chatting(response.message, response.options);
    }
}

async function chatting(message, options = null) {
    let response = await chat(message, options);
    if (Object.entries(response).length !== 0) 
        chatting(response.message, response.options);
}


async function chat(question = null, options = null) {
        let response = {};
        let query = await composeQuery(question, options);

        await inquirer
        .prompt(query)
        .then(async answer => {
            let rawResponse;

            if (options == null) {
                try {
                    rawResponse  = await api.post('/chat-movies', { message: answer.text });
                } catch (err) {
                    console.log(err);
                }
            }
            else {
                try {
                    let option = options.filter(item => item.title == answer.option)[0].value;
                    //Chat Ending Statement Condition
                    if ((question.startsWith("Entonces, estás seguro que quieres")) && (option == 'si')) {
                        await api.post('/chat-movies', { message: option });
                        return;
                    } 
                    else 
                        rawResponse  = await api.post('/chat-movies', { message: option });
                } catch (err) {
                    console.log(err);
                }

            }


            if (rawResponse.data.message[0].type === 'text') {
                response.message = rawResponse.data.message[0].content;
            }
            else if (rawResponse.data.message[0].type === 'quickReplies') {
                response.message = rawResponse.data.message[0].content.title;
                response.options = [];
                rawResponse.data.message[0].content.buttons.forEach(button => {
                    response.options.push({
                        title: button.title, 
                        value: button.value
                    });
                });
            }
        });  

        return response;
}

async function composeQuery(question, options) {

    if (question == null) {
        question = 'Connected. Please type something. ';
    }

    if (options == null) {
        return {
            type: 'input',
            name: 'text',
            message: `> ${question}\n`
        }
    } else {
        return { 
            type: 'list', 
            name: 'option', 
            message: `> ${question}\n`, 
            choices: options.map(option => option.title)
        }
    }
}










