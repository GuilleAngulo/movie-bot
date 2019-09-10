const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const MovieController = require('./controllers/movie');
const ChatController = require('./controllers/chat');

const port = require('./config/config').PORT;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


app.post('/discover-movies', MovieController.robot);
app.post('/chat-movies', ChatController.conversation);

app.post('/errors', function(req, res) {
  console.log(req.body);
  res.sendStatus(200);
});


app.listen(port, () => {
  console.log('> [movie-bot] Initializing ...');
  console.log(`> [movie-bot] Listenning on port ${port}`);
});