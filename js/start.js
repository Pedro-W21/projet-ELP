const readline = require('readline'); 
const net = require("net");
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});

const port = 9999
interface.question("\n______________________________________________________________\nClient ou Serveur ? Il faut au moins 2 clients et 1 serveur pour lancer une partie : ", (number) => {
    interface.close()
    if (number == "Serveur") {
        var exec = require("./serveur.js")
    }
    else {
        
        
        var exec3 = require("./client.js")
        setTimeout(() => {
            // console.log(global.server_exists)
            if (!global.server_exists) {
                console.log("Erreur de lancement du client, il doit manquer un serveur, lancement du serveur à la place dans ce terminal...")
                var exec2 = require("./serveur.js")
                
            }
        }, 1000)
        
        
    }
        
});