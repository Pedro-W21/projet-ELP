const net = require("net");

let compteurClient = 0;
let clients = {}; //dictionnaire des infos des clients: {socket:[id,pseudo,ready,happy]}
let round = 0;
let compteurHappy = 0;
let socketJoueurActif = 0;


//boucle serveur de connexion au port
const server = net.createServer((socket) => {
  Game.initializeRound();
  compteurClient += 1;
  clients[socket] = [compteurClient,'pseudo',false, false]; //{socket:[id,pseudo,ready,happy]}
  //affiche sur le terminal du serveur une connexion de <adresse ip> sur le port <port>, run à chaque fois qu'un client se connecte
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);

  //s'exécute à chaque fois qu'on reçoit des données du client/////////////////////////////////
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
    // si tout le monde est prêt
// ETAPE 1 //////////////////////////////////////////////////////////////////////////////////////////////
    if (compteurTemporaire == compteurClient){
      //choisir le joueur actif et demander quel mot de 1 à 5
      round += 1;
      socketJoueurActif = Object.keys(clients)[round];
      for (let socket of Object.keys(clients)){
        // définition du joueur actif et du reste
        if (socket == socketJoueurActif){
          let card = getCurrentCard();
          socket.write("actif", card); // envoie la carte de 5 mots
        }
        else {
          socket.write("passif");
        };
      };
      //on récupère le nombre choisi par le joueur actif
      if (buffer.include("number")){
        let mot = chooseWordFromCard(buffer);
        socket.write("mot_choisi", mot);
      };
// ETAPE 2 ////////////////////////////////////////////////////////////////////////////////////////////
      // vérifie s'il y a des joueurs qui ne comprennent pas certains mots
      if (buffer.include("happy")){
        if (buffer == false){
          signalUnhappyPlayer();
        };
      };
      // si on reçoit des mots à faire deviner, les renvoyer à jeu.js
      if (buffer.include("mot")){
        let fini = addClue(buffer);
// ETAPE 3 ////////////////////////////////////////////////////////////////////////////////////////////
        // si on a bien reçu tous les indices de tout le monde
        if (fini == true){
          let indices = getFinalClues(); //renvoie liste d'indices
          socketJoueurActif.write("indices", indices);
        };
      };
// ETAPE 4 ////////////////////////////////////////////////////////////////////////////////////////////
      if (buffer.include("guess")){
        // récupère le résultat si le joueur est correct ou pas
        let resultat = handleGuess(buffer);
        if (resultat == true){
          score = getScore();
          for (let socket of Object.keys(clients)){
            socket.write("score",score);
            Game.initializeRound();
          };
        }
        else if (resultat == null){
          score = getScore();
          for (let socket of Object.keys(clients)){
            socket.write("score",score);
            Game.initializeRound();
          };
        }
        else {
          score = getScore();
          for (let socket of Object.keys(clients)){
            socket.write("score",score);
            Game.initializeRound();
          };
        };
        Game.initializeRound()
      };
    };
  });


  //s'exécute quand un client ferme la connexion /////////////////////////////////
  socket.on("end", () => {
    compteurClient -= 1;
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort);
  });

  //s'exécute si erreur /////////////////////////////////
  socket.on("error", (err) => {
    console.error("Erreur sur le socket :", err.message);
  });
})

server.maxConnections = 7;
server.listen(9999);

//pour arrêter une connexion: socket.end("on peut dire qqchose ici")
// problème au niveau de l'ordre avec client pour la partie choisir une carte et le numéro, mélange actif/passif



/*
initialisation: faire new Game[nb de gens] -> lance le jeu
pour un round: Game.initializeRound()

1. demander au joueur actif un nombre de 1 à 5. 
récupère la carte avec getCurrentCard puis chooseWordFromCard(METTRE INDEX DE 1 A 5) -> renvoie le mot choisi

2. si un joueur connaît pas le mot sélectionner, appeler signalUnhappyPlayer pour redémarrer
utiliser addClue(indice) -> rajoute les indices dans une liste PAS CHECKE ENCORE, 
et renvoie un bool si on a recu tous les indices

3. getFinalClues renvoir les indices finaux après traitement des indices (genre si y'en a dupliqués et tout)
-> renvoie liste de strings

4. après que le joueur actif répond, handleGuess(guess) -> si joueur actif passe renvoie null
si c'est correct renvoie true
sinon false
pour check si le jeu est fini: renvoie true si c bien fini
gatCardLeft pour voir combien de cartes il reste, et getScore pour récupérer le score

appeler Game.initializeRound() à chaque fois qu'on passe au prochain round ou si signalUnhappyPlayer
*/