# :robot: Movie Recommendation Bot
This app begins with a chat conversation with a chatbot (service provided by [SAP Conversational AI](https://cai.tools.sap/)) where you ask for a TV serie or a movie recommendation. Thanks to the AI provided, it is possible to have a "human like" conversation with the bot (It will answer to user´s greetings, for example). Also it will try to get the parameters required for make his content suggestion by making the user choose some options asking some questions. The three parameters are: type of content (movie or TV serie), nationality of the content and genre of the content. 

After getting the parameters, it uses [The Movie Database API](https://www.themoviedb.org/documentation/api) to get the top 5 best rated content under the chosen parameters (type, nationality and genre). With this list, it makes a random choice among the content (in order to not get always the top one best rated), and starts downloading metada and data from it:

:page_facing_up: **Text**. This part of the code, making use of the [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser) provide by [Algorithmia](https://algorithmia.com/) (that provides basic API access to Wikipedia), gets the summary of the chosen content entry at Wikipedia. After that this summary is "cleaned" (removing blanks and some characters). Another service is used at this section: the [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/) provided by the [IBM´s Watson Cloud Services](https://www.ibm.com/watson). With this service, a list of keywords is extracted by text interpretation.

:camera: **Image**. In this part a poster, alternative poster and images of the selected content are downloaded. The poster and half of the images are downloaded using TMDb API, while the alternative poster and the rest of the images are downloaded from a Google search request.

:video_camera: **Youtube**. Finally it makes another request to Youtube API URL in order to get a link to a trailer of the selected media.

:package: **Cache**. Another important part is that the app implements a kind of a *cache memory*: If the random selected content was picked before, the bot doesn´t have to make every request for data again because in the folder **'/content/stored/'** there are stored all media data and metadata compressed (the file names are the content id at The Movie Database). This way the app will be faster the more is used.

## Prerequisites
### ngrok
The simples way to run the project only locally requires tunneling service, to receive the answer from chatbot service at a public address. ngrok provides a free plan, and it is possible to run it as simple as:
```
ngrok http 5000
```
The port is 5000 because our app is running at this port (is possible to change it at **"/config/config.js"**). Now the public address making a tunnel to your application running at http://localhost:5000 is shown as at the image below:

### SAP Conversational AI
It´s necessary to sign up and create the bot  
