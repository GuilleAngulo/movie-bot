# :robot: Movie Recommendation Bot
This app begins a chat conversation with a chatbot, where you can ask to have a movie or TV serie recommendation based on your criteria (type of recording, genre and nationality). After asking for all the criteria (in case some is missing) it will choose randomly one title among the best rated. Once the title is selected, one metadata document will be created (**content.json**) storing things like: title, original title, release date, summary and links from Wikipedia, keywords, Youtube trailer link, etc. Also some images will be downloaded: from the service of TheMovieDatabase 4 images and the poster, and from Google another 4 images and an alternative poster image.

## External Services
The project uses some externals services:

- [SAP Conversational AI](https://cai.tools.sap/). Provides the tools to create a chatbot with AI so the user can have a human like conversation (it recognizes such things as greetings, to answer accordingly). The bot has been developed at their page, firstly by adding two main blocks of the bot: Intents and Entities. The intents represents the purpose of the phrase, what has to be done (greetings, farewells, movie recomendation) and entities are extracts of concise information from the phrase, helping to do what has to be done (genre, type of recording). It is neccesary to give information and values in each case so the bot can interpret both intents and entities. At entities is required a little extra information, like associations between genre names and genre ids (as stored at TheMovieDatabase) and its synonyms (a user can ask for a "scary movie" referring to an horror genre movie). Finally there are triggers, requirements and actions. Triggers evaluate if there are intents at the phrase, if the "discover movie" intent is present then go to next step. In requirements is possible to specify which entities are required for which actions: if type, genre and nationality are specified by the user then go to action. AT last, actions are the place to define what to do if requirements are fullfilled: make a request to our app URL with the bots memory parameters so the app can make a new request to TheMovieDatabase API with this parameters. Otherwise is possible to define an action where the memory is removed to start the conversation again.

- [The Movie Database API](https://www.themoviedb.org/documentation/api). Provides three main services. First and most important is the discover method, making a request (using chatbot response parameters) a list of suggested films is returned sorted by popularity. Also there methods to get the selected media images and the poster.

- [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser). This service, included at [Algorithmia](https://algorithmia.com/), is used to store at the metadata file (**content.json**) a Wikipedia summary of the selected media as well as the reference links (provides basic API access to Wikipedia).

- [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/). With this service, included at [IBM´s Watson Cloud Services](https://www.ibm.com/watson), it is possible to make a request with a selected text and get an analysis with keywords as a result. In this case keywords taken from wikipedia summary text.

- [Youtube API](https://developers.google.com/youtube/v3/docs/search/list). Also the Youtube API service is used to make a request in order to get a youtube link with the trailer of the selected movie or TV serie.

- [Google Custom Search Engine](https://cse.google.com/). Google Custom Search enables to create a custom search engine for your app. This service is used to get an alternative poster image as well as other images, in case the media collected from TheMovieDatabase is not enough.

## Code Sections

- :speech_balloon: **Chat**.

- :dizzy: **Movie Discover**. At the SAP Conversational AI chatbot setup is defined that the last action is to send a POST request with the conversation parameters to our http://localhost:5000/chat-movies app listening address. The app receives this parameters and makes a new request to the TMDb API to get a list of movies/TV series based on this parameters. Once it haves the list, one title will be randomly chosen amongst the 5 best rated (at **"/config/config.js"** is possible to change the variable **NUMBER_RESULTS** to a higher number, to prevent the app repeating same recommendations). 

- :page_facing_up: **Text**. When the first request (discover method) is made to TheMovieDatabase API, the result data is stored at one "metadata" file: **content.json**. After that, more information is added to that file accross the app flow. To begin with the [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser) is called in order to get the summary of the chosen movie/TV serie entry at Wikipedia. After that this summary is "cleaned"(removing blanks and some characters) for clarity reasons. Then the [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/) is used to get a list of keywords (by its text interpretator). 

- :camera: **Image**. In this part a poster, alternative poster and images of the selected content are downloaded. The poster and half of the images are downloaded using TMDb API, while the alternative poster and the rest of the images are downloaded from a Google search request.

- :video_camera: **Youtube**. Finally it makes another request to Youtube API URL in order to get a link to a trailer of the selected media.

- :package: **Cache**. Another important part is that the app implements a kind of a *cache memory*: If the random selected content was picked before, the bot doesn´t have to make every request for data again because in the folder **'/content/stored/'** there are stored all media data and metadata compressed (the file names are the content id at The Movie Database). This way the app will be faster the more is used.

## Prerequisites
### ngrok
The simples way to run the project in your computer it may requires tunneling service, to receive the answer from chatbot service at a public address:  It creates a public URL for you and forwards requests to your computer. The service at ngrok offres a free plan, and it is possible to run it as simple as:
```
ngrok http 5000
```
The port selected is 5000 because our app is running at this port (is possible to change it at **"/config/config.js"**). Now the public address making a tunnel to your application running at http://localhost:5000 is shown as at the image below:

### SAP Conversational AI Bot
It´s necessary to sign up and create the bot  
