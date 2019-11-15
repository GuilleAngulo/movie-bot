'use strict';

const inquirer = require('inquirer');
const axios = require('axios');
const ngrokURL = require('../config/config').NGROK_TUNNEL_URL;
const api = axios.create({
    baseURL: ngrokURL,
});

chat();



function chat() {
        inquirer.prompt([
            { 
                type: 'input',
                name: 'searchTerm',
                message: 'Chat initialized...\n '
            },
        ])
        .then(async answer => {
            const response = await api.post('/chat-movies', { message: answer.searchTerm });
            console.log(response.data.message[0].content.title ? response.data.message[0].content : response.data.message[0].content.title);
        });  
}









