'use strict';

const sapcai = require('sapcai').default;
const sapcaiCredentials = require('../credentials/sap-conversational-ai');


module.exports = {
    async conversation(req, res) {
        const client = new sapcai(sapcaiCredentials.DEVELOPER_TOKEN);
        const build = client.build;
        build.dialog({
            'type': 'text', 
            content: req.body.message
        }, { 
            conversationId: 'CONVERSATION_ID' 
        })
        .then(response => {
            res.status(200).send({ message: response.messages})
        })
        .catch(err => console.error('> [movie-bot] Something went wrong: ', err))
    }
}