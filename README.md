# :robot: Movie Recommendation Bot :movie_camera:
This app begins with a chat conversation with a chatbot (service provided by [SAP Conversational AI](https://cai.tools.sap/)) where you ask for a TV serie or a movie recommendation. Thanks to the AI provided, it is possible to have a "human like" conversation with the bot (It will answer to user´s greetings, for example). Also it will try to get the parameters required for make his content suggestion by making the user choose some options asking some questions. The three parameters are: type of content (movie or TV serie), nationality of the content and genre of the content. 

After getting the parameters, it uses [The Movie Database API](https://www.themoviedb.org/documentation/api) to get the top 5 best rated content under the chosen parameters (type, nationality and genre). With this list, it makes a random choice among the content (in order to not get always the top one best rated), and starts downloading metada and data from it:

:page_facing_up: **Text**. This part of the code, making use of the [Wikipedia Parser Algorithm](https://algorithmia.com/algorithms/web/WikipediaParser) provide by [Algorithmia](https://algorithmia.com/) (that provides basic API access to Wikipedia), gets the summary of the chosen content entry at Wikipedia. After that this summary is "cleaned" (removing blanks and some characters). Another service is used at this section: the [Natural Language Understanding service](https://www.ibm.com/watson/services/natural-language-understanding/) provided by the [IBM´s Watson Cloud Services](https://www.ibm.com/watson). With this service, a list of keywords is extracted by text interpretation.

2- :camera: **Image**. 

