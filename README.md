# commandertracker
A simple Web app for people to track commander games with friends.

Built with Python, JS, HTMl, and SQlite.

Purpose: My player table was using some Google Sheets templates to track commander matches. I ran into numerous issues with this. Commander creation required manually entering in commander name, colour identity, etc. Another problem I had is I wanted to build some custom dashboards of the data, but due to the table design tools like Power BI struggled to properly work with the data. This project was created to simply commander creation, as well as provide a back-end database that analytics can be run against.

Warnings:
This app has no input validation. No login page. If you run this, it is recommended you secure it appropriately. Example: restrict access to it to a proxy server with an authentication page before granting access to the page.
This the first program I've made in 20 years. A lot of this is new to me. The last website I made was in ASPX where all my code could be in a single file, JS, Python, creating and calling API's are all firsts for me on this project. As such I had to lean on a lot of resources to build this out, it is likely sub-optimal, filled with bugs/vulnerabilities, and has low/no input validations.

Setup:
Clone this project to your local system.
Change directories to folder application is downloaded to.
Optional - Create a persistent folder to hold the sqlite database and mount to the docker container. This is required if you would like your database to be persistent.
Build the dockerfile
Example: 
docker build -t commandertracker .

Run the docker project:
docker run -d -p 8000:8000 -v <local-folder-path>:/app/db --name ComanderTracker commandertracker


Usage:
Players Page:
Type in a name in the textbox at the bottom and create player. This will add that player to the players database.

Commanders Page:
Copy and paste a link to a cards Scryfall page. This will pull some of the commander's data and save it to the available commanders to track.
Information stored: Name, Mana Cost, Colour Identity, and the link to the Scryfall page. 
The page additionally displays all of this information on the Commanders page in addition to a count of the number of times that commander has been played across all matches.

Matches Page:
This page is used to display match information. 
Print allows for the page to by printed or saved as a PDF.
The table displays Match ID #, Player Name, Commander, Place, and Notes for each game/player.
The search bar filters the table.
The table lets you update the "Place" field if a players place was added incorrectly.
The "Add Match" button allows you to add a new match to the database. This function does require that the players and commanders you wish to mark in games are already created.

Add-Match Page:
Select a number of players that palyed in a match (currently minimum of 2 players, and maximum of 8).
Select a player name, commander, and place they came in for each player. Add notes if desired and add match. This will now be visible in the Match table.

Future Plans:
Point tracking - Assign points to players based on what place they came in on a match as well as settings so people can modify point values.
Hate Tracking - Allow people to identify a person they hated during the match (can be used to deduct points or track problem commanders/players). 
Expand Players Page - Include matches they've played, their most used commander, and average position or winrate.
Edit Maches - Ability to fix Player Name or Commander for matches not just the place they came in.
Dashboards:
Player stats pages (most played commanders, most/lease succesful colours/commanders, arch enemy (people/commanders who beat them most)
Commander stats pages (play rates, win rates, hate rates, etc)
Expand Commander Page - Have table load mana symbols instead of letters and numbers (in or out of brackets). 


Database layout:
Database is a simple 4 table database. 
Matches: stores MatchID numbers and notes that people input about the match.
Commanders: stores information pulled from Scryfall.
Players: stores playname and an ID #.
MatchPlayer: Pulls the GameNumber, UUID, and PlayerID from their respective tables and stores a place for them in that match ID.
<img width="1279" height="351" alt="image" src="https://github.com/user-attachments/assets/456b0a6d-1c30-4e55-9997-6a6a5f24ce85" />

