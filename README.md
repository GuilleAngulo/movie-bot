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

- :speech_balloon: **Chat**. The chat controller is located at the 'controllers' folder. Its purpose is to start a new SAP Conversational AI client (using the developer Token provided to identify the robot) and create a dialog with the service: listening to POST requests at http://localhost:5000/chat-movies and sending the messages received to the robot. The chat service, located at 'services' folder, is used only for the command based app. Using the node module **inquirer**, it makes the command line chat more interactive (the answer options by the robot are showed to the user as an interactive list). The chat issue is solved using a recursion function where the answers of the robot are passed as new questions to the user. The recursion ends when one condition is filled: The robot question starts with a certain phrase (last confirmation for finish the chat) and the user answer is "yes".

- :dart: **Movie Discover**. At the SAP Conversational AI chatbot setup is defined that the last action is to send a POST request with the conversation final parameters to our http://localhost:5000/discover-movies app listening address. The app receives this parameters and makes a new request to the TMDb API to get a list of movies/TV series based on this parameters. Once it haves the list, one title will be randomly chosen amongst the 5 best rated (at **/config/config.js** is possible to change the variable **NUMBER_RESULTS** to a higher number, to prevent the app repeating same recommendations). 

- :page_facing_up: **Text**. When the first request (discover method) is made to TheMovieDatabase API, the result data is stored at one "metadata" file: **content.json**. After that, more information is added to that file accross the app flow. To begin with the [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser) is called in order to get the summary of the chosen movie/TV serie entry at Wikipedia. After that this summary is "cleaned"(removing blanks and some characters) for clarity reasons. Then the [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/) is used to get a list of keywords (by its text interpretator). 

- :camera: **Image**. In this part a poster, alternative poster and images of the selected content are downloaded. The poster and half of the images are downloaded using TMDb API, while the alternative poster and the rest of the images are downloaded from a Google search request.

- :video_camera: **Youtube**. Finally it makes another request to Youtube API URL in order to get a link to a trailer of the selected media.

- :package: **Cache**. Another important part is that the app implements a kind of a *cache memory*: If the random selected content was picked before, the bot doesn´t have to make every request for retrieving data again because in the folder **/content/stored/** there are stored all media data and metadata compressed (the file names are the content id at The Movie Database). This way the app will be faster the more is used.

- :floppy_disk: **Metadata**. This service is in charge for providing **save()** and **load()** functions to add new content to the metadata file "content.json".

## Prerequisites
### ngrok
The simples way to run the project in your computer requires tunneling service to receive the answer from the chatbot service at a public address: It creates a public URL for you and forwards requests to your computer. [The ngrok page](https://dashboard.ngrok.com/signup) offers a free plan, and it is possible to run it as simple as:
```
ngrok http 5000
```
The port selected is 5000 because our app is running at this port (is possible to change it at **/config/config.js**). Now the public address (https://XXX.ngrok.io) making a tunnel to your application running at http://localhost:5000 is shown as at the image below:

![alt text](https://github.com/GuilleAngulo/movie-bot/blob/master/assets/images/ngrok.png)

**IMPORTANT**: As the ngrok account used is free, the public address will be changing each time ngrok service is stopped and started again. So its neccesary with each new app deploy to change the new public address at **/config/config.js**:
```
NGROK_TUNNEL_URL: https://XXX.ngrok.io
```
And also change it at the bot configuration, as described at the following step.

### SAP Conversational AI Account and Bot
It´s necessary to sign up (is possible to do it with an existing GitHub account) and create bot. Fork the bot used at this project from [here](https://cai.tools.sap/guilleangulo/movie-bot/train/intents), by just selecting "fork" button. Next you will be able to change the base of the bot (by adding othe languages or changing values at bot asnwers). Finally is necessary to change the action that will send chat values to the running app. To do this, just click on "Build" tab and select "Discover" skill. Then go to "Actions" tab and change Webhook Configuration Base URL with your ngrok public URL (taken from the previous step) and add the "discover-movies" routes to it: **https://XXX.ngrok.io/chat-movies**. Finally, to be able to comunicate with your bot from the app you have to change at **'controllers/chat.js (line 9)'** the Developer Token provided at your SAPCAI account:
```
const client = new sapcai(YOUR_DEVELOPER_TOKEN);
```
![alt text](https://github.com/GuilleAngulo/movie-bot/blob/master/assets/images/sapcai-bot-action.png)

### The Movie Database API Credentials
To have access to TMDb API is essencial to have an API Key in order to make use of their services. Is as simple as [sign up here](https://www.themoviedb.org/account/signup), copy your API Key and paste it at **services/moviedb-api.js** at the two functions params:
```
params: { api_key: YOUR_API_KEY ...
```

### Algorithmia Account
After creating a free account [here](https://algorithmia.com/signup), copy your API Key at your account menu and paste it at **services/text.js (line 41)**: 
```
const algorithmiaAuthenticated = algorithmia(YOUR_ALGORITHMIA_API_KEY);
```

### IBM Cloud Service Account
Is possible to create an account [here](https://cloud.ibm.com/registration). After that, is required to create the [Natural Language Understanding service](https://cloud.ibm.com/catalog/services/natural-language-understanding). Finally, at the admin page of the service, there is a a tab named 'Service credentials' where you can copy all the values into a document and name it as **'watson-nlu.js'** at **credentials** folder.

### Google Cloud Plataform Account
This part is optional: The images and poster of the movie/TV serie are already downloaded from TheMovieDatabase DB, so this is an additional content. An option to run the app without using this API service is to comment both functions at **services/image.js** as below:
```
// await donwnloadAlternativePoster(media);
// await downloadImagesFromGoogle(media);
```
Otherwise, to have this part working, is needed to link a Google account to the [Google Plataform Cloud](https://cloud.google.com/). This service is free, but other resources are paid. That´s why accross the process you´ll be asked to insert one payment method (no need to worry, this project only uses a free service). After that you´ll be asked to create a new project, and once it is selected go to **APIs > Library**. The service used is **Custom Search API**, so after searching and activating it a notification will appear asking to "Create credencials". Finally the API required is ready, copy and paste at **services/image.js (line 47)**:
```
 auth: YOUR_GOOGLE_CLOUD_API_KEY,
```
After that is possible to custom the search engine created by accessing **Custom Search Engine**, and filling 'Sites to search' with 'google.com' and at 'Advance settings' select for Schema type **Thing**. Then, accessing control panel, is required to activate "Image search" and copy the search engine ID and paste it at **services/image.js (line 48)**:
```
 cx: YOUR_SEARCH_ENGINE_ID,
```
