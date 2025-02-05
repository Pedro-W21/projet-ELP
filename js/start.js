const readline = require('readline'); 
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});
let fichier = ""

interface.question("\n______________________________________________________________\nClient ou Serveur ? Il faut au moins 2 clients et 1 serveur pour lancer une partie : ", (number) => {
    interface.close()
    if (number == "Serveur") {
        fichier = "./serveur.js"
    }
    else {
        fichier = "./client.js"
    }
    var exec = require(fichier)
});