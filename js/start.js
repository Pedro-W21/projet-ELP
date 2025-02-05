const readline = require('readline'); 
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});

interface.question("---------------------\nClient ou Serveur ? Il faut au moins 2 clients et 1 serveur pour lancer une partie : ", (number) => {
    if (number == "Client") {
        var exec = require("./client.js")
    }
    else {
        var exec = require("./serveur.js")
    }
});