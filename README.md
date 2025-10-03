# commandertracker
A simple Web app for people to track commander games with friends.

Built with Python, JS, HTMl, and SQlite.

Purpose: My player table was using some Google Sheets templates to track commander matches. I ran into numerous issues with this. Commander creation required manually entering in commander name, colour identity, etc. Another problem I had is I wanted to build some custom dashboards of the data, but due to the table design tools like Power BI struggled to properly work with the data. This project was created to simply commander creation, as well as provide a back-end database that analytics can be run against.

Warnings:
This app has no input validation. No login page. If you run this, it is recommended you secure it appropriately. Example: restrict access to it to a proxy server with an authentication page before granting access to the page.
This the first program I've made in 20 years. A lot of this is new to me. The last website I made was in ASPX where all my code could be in a single file, JS, Python, creating and calling API's are all firsts for me on this project. As such I had to lean on a lot of resources to build this out, it is likely sub-optimal, filled with bugs/vulnerabilities, and has low/no input validations.

Installation: https://github.com/vc-w/commandertracker/wiki/Installation

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
Select a player name, commander, place they came, notes, and someone they hated during the ma tch for each player.

Future Plans:
Point tracking - Assign points to players based on what place they came in on a match as well as settings so people can modify point values.
Hate Tracking - Work wtih data to identify most hated commanders/players. 
Expand Players Page - Include matches they've played, their most used commander, and average position or winrate.
Edit Maches - Ability to fix Player Name or Commander for matches not just the place they came in.
Dashboards:
Player stats pages (most played commanders, most/lease succesful colours/commanders, arch enemy (people/commanders who beat them most)
Commander stats pages (play rates, win rates, hate rates, etc)
Expand Commander Page - Have table load mana symbols instead of letters and numbers (in or out of brackets). 


Information about design can be found in the Wiki.
https://github.com/vc-w/commandertracker/wiki/Database-Design

Problems and Roadmap can be found in the Projects page.
https://github.com/users/vc-w/projects/1
