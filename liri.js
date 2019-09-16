require('dotenv').config();  

const keys = require('./keys'), 
      chalk = require('chalk'), 
      axios = require('axios'),
      Spotify = require('node-spotify-api'),
      moment = require('moment'),
      dotenv = require('dotenv'),
      fs = require("fs");

var command = process.argv[2];
    query = process.argv.slice(3).join(" ");

var spotify = new Spotify({ 
        id: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
});

switch(command){
    case "movie-this":
            ShowMovieInformation(`${query}`);
            break;
            
    case "concert-this":
            ShowBandsInTownInformation(`${query}`);
            break;

    case "spotify-this-song":
            ShowSongTrackInformation(`${query}`)
            break;

    case "do-what-it-says":
            ExecuteFile();
            break;

    default:
            EmptyCommand();
}


function ShowMovieInformation(info){
    //If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
    if(info == "" || info == null || info.length == 0){
        info = "Mr.Nobody"
    }
    axios
        .get("http://www.omdbapi.com/?t=" + info + "&apikey=" + keys.omdbAPIKey)
        .then(function(response) {
            var movieData = response.data;
            console.log(chalk.cyan("   Title\t\t\t: ") + movieData.Title);
            console.log(chalk.cyan("   Year\t\t\t\t: ") + movieData.Year);

            for(var i = 0; i < movieData.Ratings.length; i++){
                if(movieData.Ratings[i].Source == "Internet Movie Database"){
                    console.log(chalk.cyan("   " + movieData.Ratings[i].Source + " \t: ") + movieData.Ratings[i].Value)
                }

                if(movieData.Ratings[i].Source == "Rotten Tomatoes"){
                    console.log(chalk.cyan("   " + movieData.Ratings[i].Source + "\t\t: ") + movieData.Ratings[i].Value)
                }
            }

            console.log(chalk.cyan("   Country\t\t\t: ") + movieData.Country);
            console.log(chalk.cyan("   Language\t\t\t: ") + movieData.Language);
            console.log(chalk.cyan("   Cast\t\t\t\t: ") + movieData.Actors);
            console.log(chalk.cyan("   Plot\t\t\t\t: ") + movieData.Plot);
            
        })
        .catch(function(error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log("Error", error.message);
            }
            console.log(error.config);
        }
    );
}

function ShowSongTrackInformation(info){

    if(info == "" || info == null || info.length == 0){
        info = "The Sign"
    }

    spotify.search({ type: 'track', query: info}, function(err, data) {
        if (err) {
          return console.log('Error occurred: ' + err);
        }

        var songDetails = data.tracks.items;
    
        console.log("\t> " + chalk.green('LIRI:') + " I found " + chalk.red(songDetails.length) + " results for you\n\n");

        for(var i = 0; i < songDetails.length; i++){
            console.log("============================== Track Result #" + (i+1) + " =================================");

            console.log(chalk.green("\n\tSong Title \t: ") + songDetails[i].name);
            console.log(chalk.green("\n\tArtist \t\t: ") + songDetails[i].album.artists[0].name);
            console.log(chalk.green("\n\tAlbum \t\t: ") + songDetails[i].album.name);
            console.log(chalk.green("\n\tSong URL \t: ") + chalk.blue(songDetails[i].preview_url) + "\n");
        }
      });
}

function ShowBandsInTownInformation(info){

    if(info == "" || info == null || info.length == 0){
        console.log(chalk.green("\t> LIRI:") + " You're searching for an empty query. Please type something.");
        
    }else{    
        axios
            .get("https://rest.bandsintown.com/artists/" + info + "/events?app_id=codingbootcamp")
            .then(function(response) {

                var data = response.data;

                if(data == null || data == 0 || data == ""){
                    console.log(chalk.green("\t> LIRI:") + " I'm sorry, but concert data 404");
                
                }else 
                    if(data.length == 1){
                        console.log(chalk.green("\t> LIRI:") + " I have " + chalk.red(data.length) + " result for you\n");       
                    }else{
                        console.log(chalk.green("\t> LIRI:") + " I have " + chalk.red(data.length) + " results for you\n");
                    }
                
                for(var i = 0; i < data.length; i++){
                    if(moment(moment()).isBefore(data[i].datetime, 'week')){
                        var eventNumber = 1;
                        eventNumber+=eventNumber;
                        
                        console.log(chalk.yellow("\n\tArtist/Band Name: ") + data[i].lineup);
                        console.log(chalk.yellow("\n\ttVenue Name\t: ") + data[i].venue.name);
                        console.log(chalk.yellow("\n\tLocation  \t: ") + data[i].venue.city + ", " +
                                        data[i].venue.region + ", " + data[i].venue.country);
                        console.log(chalk.yellow("\n\tDate  \t\t: ") + moment(data[i].datetime).format("MM/DD/YYYY") + "\n\n");
                    }
                }
            
            }   
        )
        .catch(function(error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log("Error", error.message);
        }
        console.log(error.config);
        });
    }   
}

function ExecuteFile(){

    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        }
        
        var dataArr = data.split(",");

      
        ShowSongTrackInformation(dataArr[1]);
      
      });
      
}

function EmptyCommand(){
    console.log('No command found');
}