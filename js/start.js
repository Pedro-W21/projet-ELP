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
        let server_exists = false;
        let local_client = net.createConnection(port, 'localhost', () => { //connecte au port choisi
            server_exists = true;
            local_client.end()
        });
        local_client.on("error", (err) => {
            server_exists = false
            local_client.end()
        });
        setTimeout(() => {
            // console.log(global.server_exists)
            if (!server_exists) {
                console.log("Erreur de lancement du client, il doit manquer un serveur, lancement du serveur à la place dans ce terminal...")
                var exec2 = require("./serveur.js")
                console.log("Relance du client")
                var exec3 = require("./client.js")
                
            }
            else {
                var exec3 = require("./client.js")
            }
        }, 1000)
        
        
    }
        
});