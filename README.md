# :robot: Movie Recommendation Bot
This app begins with a chat conversation with a chatbot (service provided by [SAP Conversational AI](https://cai.tools.sap/)) where you ask for a TV serie or a movie recommendation. Thanks to the AI provided, it is possible to have a "human like" conversation with the bot (It will answer to user´s greetings, for example). Also it will try to get the parameters required for make his content suggestion by making the user choose some options asking some questions. The three parameters are: type of content (movie or TV serie), nationality of the content and genre of the content. 

After getting the parameters, it uses [The Movie Database API](https://www.themoviedb.org/documentation/api) to get the top 5 best rated content under the chosen parameters (type, nationality and genre). With this list, it makes a random choice among the content (in order to not get always the top one best rated), and starts downloading metada and data from it:


## Services
The project uses some externals services:

- [SAP Conversational AI](https://cai.tools.sap/). Provides the tools to create a chatbot with AI so the user can have a human like conversation (it recognizes such things as greetings, to answer accordingly). The bot has been developed at their page, firstly by adding the two main blocks of the bot: Intents and Entities. The intents represents the purpose of the phrase, what has to be done (greetings, farewells, movie recomendation) and entities are extracted concise information from the phrase, helping to do what has to be done (genre, type of recording). It is neccesary to give information and values in each case so the bot can interpret both intents and entities. At entities is required a little extra information, like associations between genre names and genre ids (as stored at TheMovieDatabase) and its synonyms (a user can ask for a "scary movie" referring to an horror genre movie). Finally the are triggers, requirements and actions. Triggers evaluate if intents are at the phrase, if the "discover movie" intent is present then go to next step. In requirements is possible to specify which entities are required for which actions, if type, genre and nationality are specified by the user then go to action. And at actions is the place to define what to do if requirements are fullfilled: make a request to a URL with the bots memory parameters so the app can make a new request to TheMovieDatabase API with this parameters. Otherwise is possible to define an action where the memory is removed to start the conversation again.



- [The Movie Database API](https://www.themoviedb.org/documentation/api)

- [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser)

- [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/)

- [Youtube API](https://developers.google.com/youtube/v3/docs/search/list)

:page_facing_up: **Text**. This part of the code, making use of the [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser) provide by [Algorithmia](https://algorithmia.com/) (that provides basic API access to Wikipedia), gets the summary of the chosen content entry at Wikipedia. After that this summary is "cleaned" (removing blanks and some characters). Another service is used at this section: the [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/) provided by the [IBM´s Watson Cloud Services](https://www.ibm.com/watson). With this service, a list of keywords is extracted by text interpretation.

:camera: **Image**. In this part a poster, alternative poster and images of the selected content are downloaded. The poster and half of the images are downloaded using TMDb API, while the alternative poster and the rest of the images are downloaded from a Google search request.

:video_camera: **Youtube**. Finally it makes another request to Youtube API URL in order to get a link to a trailer of the selected media.

:package: **Cache**. Another important part is that the app implements a kind of a *cache memory*: If the random selected content was picked before, the bot doesn´t have to make every request for data again because in the folder **'/content/stored/'** there are stored all media data and metadata compressed (the file names are the content id at The Movie Database). This way the app will be faster the more is used.

## Prerequisites
### ngrok
The simples way to run the project in your computer it may requires tunneling service, to receive the answer from chatbot service at a public address:  It creates a public URL for you and forwards requests to your computer. The service at ngrok offres a free plan, and it is possible to run it as simple as:
```
ngrok http 5000
```
The port selected is 5000 because our app is running at this port (is possible to change it at **"/config/config.js"**). Now the public address making a tunnel to your application running at http://localhost:5000 is shown as at the image below:

### SAP Conversational AI Bot
It´s necessary to sign up and create the bot  
