const net = require("net");

let compteurClient = 0;
let clients = {}; //dictionnaire des infos des clients: {socket:[id,pseudo,ready]}

//fonction pour récolter les infos des clients
function initialisation_client(clients){
    for (let socket of Object.keys(clients)) {
        socket.write("Vous êtes le client numéro: ${id}\n");
    }
};

//boucle serveur de connexion au port
const server = net.createServer((socket) => {
  compteurClient += 1;
  clients[socket] = [compteurClient,'pseudo',false]; //{socket:[id,pseudo,ready]}
  //affiche sur le terminal du serveur une connexion de <adresse ip> sur le port <port>, run à chaque fois qu'un client se connecte
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);

  //s'exécute à chaque fois qu'on reçoit des données du client
  socket.on("data", (buffer) => {
    buffer.toString("utf-8");
    if (buffer.include("pseudo")){
        clients[socket][1] = buffer; //récupère le pseudo entré par le client
    }
    else if (buffer.include("ready")){
        buffer.toBool();
        clients[socket][2] = buffer; //regarde si le client est ready ou pas
    };
    //on vérifie si tout le monde est prêt
    let compteurTemporaire = 0;
    for (let list of Object.values(clients)){
        if (list[2] == true){
            compteurTemporaire += 1;
        };
    };

    //choisir joueur actif et demander quel mot de 1 à 5
    


    
    socket.write(`${buffer.toString("utf-8").toUpperCase()}\n`); //exemple écrit buffer en verr maj dans la console du client
  });

  //s'exécute quand un client ferme la connexion
  socket.on("end", () => {
    compteurClient -= 1;
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort);
  });

  //s'exécute si erreur
  socket.on("error", (err) => {
    console.error("Erreur sur le socket :", err.message);
  });
})

server.maxConnections = 7;
server.listen(9999);
//pour arrêter une connexion: socket.end("on peut dire qqchose ici")


/*
initialisation: faire new Game[nb de gens] -> lance le jeu
pour un round: Game.initializeRound()

1. demander au joueur actif un nombre de 1 à 5. 
récupère la carte avec getCurrentCard puis chooseWordFromCard(METTRE INDEX DE 1 A 5) -> renvoie le mot choisi

2. si un joueur connaît pas le mot sélectionner, appeler signalUnhappyPlayer pour redémarrer
utiliser addClue(indice) -> rajoute les indices dans une liste PAS CHECKE ENCORE, 
et renvoie un bool si on a recu tous les indices

3. getFinalClues renvoir les indices finaux après traitement des indices (genre si y'en a dupliqués et tout)
-> renvoir liste de strings

4. après que le joueur actif répond, handleGuess(guess) -> si joueur actif passe renvoie null
si c'est correct renvoie true
sinon false
pour check si le jeu est fini: renvoie true si c bien fini
gatCardLeft pour voir combien de cartes il reste, et getScore pour récupérer le score

appeler Game.initializeRound() à chaque fois qu'on passe au prochain round ou si signalUnhappyPlayer
*/

/*
les messages de client arrivent -> faire buffer.toString et pour savoir quelles data arrivent, faire
buffer.include("bla") pour voir si ça contient bla

pseudo, ready
*/