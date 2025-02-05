const net = require("net");
const game = require("./jeu.js")

let compteurClient = 0;
let clients = {}; //dictionnaire des infos des clients: {socket:[id,pseudo,ready,happy]}
let round = 0;
let compteurHappy = 0;
let socketJoueurActif = 0;
let jeu = new game(0);
let jeucommence = false;
let nombre = 0;
let compteur = 0;
let round_commence = false;


//boucle serveur de connexion au port
const server = net.createServer((socket) => {
  if (!jeucommence) {
    let valeur_a = compteurClient
    clients[valeur_a] = [valeur_a, 'pseudo', false, false, socket]
    compteurClient += 1
    console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);
    socket.on("data", (buffer) => {
      let texte = buffer.toString("utf-8");
      console.log(texte)
      if (texte.includes("pseudo")){
          console.log("NOUVEAU JOUEUR DE PSEUDO : " + texte.split(" ")[1])
          liste = texte.split(' ');
          clients[valeur_a][1] = liste[1]; //récupère le pseudo entré par le client
      }
      else if (texte.includes("ready")){
          liste = texte.split(' ');
          console.log("READY DE FOU : " + valeur_a.toString())
          let booleen = (liste[1] == "true");
          clients[valeur_a][2] = booleen; //regarde si le client est ready ou pas
      };

      //on vérifie si tout le monde est prêt
      let compteurTemporaire = 0;
      for (let list of Object.values(clients)){
          if (list[2] == true){
              compteurTemporaire += 1;
          };
      };
      //console.log(clients)
      // si tout le monde est prêt
  // ETAPE 1 //////////////////////////////////////////////////////////////////////////////////////////////
      if (compteurTemporaire == compteurClient){
        if (jeucommence == false){
          jeu = new game(compteurClient);
          jeucommence = true;
        };
        //choisir le joueur actif et demander quel mot de 1 à 5

        tour = round%compteurClient;
        if (!round_commence) {
          jeu.initializeRound()
          jeu.pickWords()
          socketJoueurActif = Object.keys(clients)[tour];
          for (let cles of Object.keys(clients)){
            // définition du joueur actif et du reste
            if (cles == socketJoueurActif){ //cles[1] désigne la socket
              clients[cles][4].write("actif");
            }
            else {
              clients[cles][4].write("passif");
            };
          };
          round_commence = true
          
        }
        //on récupère le nombre choisi par le joueur actif
        if (texte.includes("number")){
          liste = texte.split(' ');
          nombre = Number(liste[1]); //récupère l'index du mot choisi
          let mot = jeu.chooseWordFromCard(nombre);
          compteurHappy = compteurClient - 1;
          compteur = 0;
          for (let autre_client of Object.keys(clients)) {
            if (clients[autre_client][4] != socket) {
              clients[autre_client][4].write("happy? "+ mot);
            }
          }
        };
  // ETAPE 2 ////////////////////////////////////////////////////////////////////////////////////////////
        // vérifie s'il y a des joueurs qui ne comprennent pas certains mots
        if (texte.includes("happy")){
          compteur += 1; //compteur pour voir si tous les clients ont été concertés
          liste = texte.split(' ');
          let reponse = liste[1];
          if (reponse == 'non'){
            clients[socketJoueurActif][4].write("exclude "+ nombre.toString()); //reprend l'index du mot choisi
            continuer = jeu.reinitializeFromChoice();
            compteurHappy = compteurClient - 1;
            compteur = 0;
            if (continuer == false){
              clients[socketJoueurActif][4].write('nouvellecarte'); //dans le cas où personne ne comprend aucun des 5 mots, prend une nouvelle carte
              carte = jeu.pickWords();
            };
          };
          if (compteur == compteurHappy){ //si tout les clients ont été concertés
            if (compteurHappy == compteurClient - 1){ //si tout le monde est content
              for (let autre_client of Object.keys(clients)) {
                if (autre_client != socketJoueurActif) {
                  clients[autre_client][4].write('indice? ' + jeu.getChosenWord());
                }
              }
            };
          };     
        };
        // si on reçoit des mots à faire deviner, les renvoyer à jeu.js
        if (texte.includes("mot")){
          liste = texte.split(' ');
          let fini = jeu.addClue(liste[1]);
  // ETAPE 3 ////////////////////////////////////////////////////////////////////////////////////////////
          // si on a bien reçu tous les indices de tout le monde
          if (fini == true){
            let indices = jeu.getFinalClues(); //renvoie liste d'indices
            clients[socketJoueurActif][4].write("réponse? "+ indices.toString());
          };
        };
  // ETAPE 4 ////////////////////////////////////////////////////////////////////////////////////////////
        if (texte.includes("guess")) {
          // récupère le résultat si le joueur est correct ou pas
          let resultat = jeu.handleGuess(texte.split(" ")[1]);
          if (resultat == true){
            score = jeu.getScore();
            for (let cle of Object.keys(clients)){
              clients[cle][4].write("score_gagne " + score);
            };
          }
          else if (resultat == null){
            score = jeu.getScore();
            for (let cle of Object.keys(clients)){
              clients[cle][4].write("score_pass " + score);
            };
          }
          else {
            score = jeu.getScore();
            for (let cle of Object.keys(clients)){
              clients[cle][4].write("score_perdu " + score);
            };
          };
          jeu.initializeRound();
          round += 1;
          jeu.pickWords();
          round_commence = false;
          if (jeu.getCardsLeft() <= 0) {
            for (let cle of Object.keys(clients)){
              clients[cle][4].write("fin " + score);
              clients[cle][2] = false
            };
            jeucommence = false
          }
        };
      };

    })
    socket.on("close", (error) => {
      if (error) {
        console.log("Client errored out\n")
      }
      else {
        console.log("Client left\n")
      }
    })
  }
  else {
    socket.write("deja_commence")
  }
  
});

/*const server2 = net.createServer((socket) => {
  jeu.initializeRound();

  //s'exécute à chaque fois qu'on reçoit des données du client/////////////////////////////////
  socket.on("data", (buffer) => {
    let liste = [];
    compteurClient += 1;
    clients[(socket.remoteAddress,socket.remotePort)] = [compteurClient,'pseudo',false, false]; //{(socket,ip):[id,pseudo,ready,happy]}
    //affiche sur le terminal du serveur une connexion de <adresse ip> sur le port <port>, run à chaque fois qu'un client se connecte
    console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);
    let texte = buffer.toString("utf-8");
    if (texte.includes("pseudo")){
        liste = texte.split(' ');
        clients[(socket.remoteAddress,socket.remotePort)][1] = liste[1]; //récupère le pseudo entré par le client
    }
    else if (texte.includes("ready")){
        liste = texte.split(' ');
        let booleen = liste[1].toBool();
        clients[(socket.remoteAddress,socket.remotePort)][2] = booleen; //regarde si le client est ready ou pas
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
      if (jeucommence == false){
        jeu = new Game(compteurClient);
      };
      jeucommmence = true;      
      //choisir le joueur actif et demander quel mot de 1 à 5
      tour = round%compteurClient;
      socketJoueurActif = Object.keys(clients)[tour];
      for (let cles of Object.keys(clients)){
        // définition du joueur actif et du reste
        if (cles[1] == socketJoueurActif){ //cles[1] désigne la socket
          socket.write("actif");
        }
        else {
          socket.write("passif");
        };
      };
      //on récupère le nombre choisi par le joueur actif
      if (texte.includes("number")){
        liste = texte.split(' ');
        nombre = Number(liste[1]); //récupère l'index du mot choisi
        let mot = jeu.chooseWordFromCard(nombre);
        compteurHappy = compteurClient;
        compteur = 0;
        socket.write("happy? "+ mot);
      };
// ETAPE 2 ////////////////////////////////////////////////////////////////////////////////////////////
      // vérifie s'il y a des joueurs qui ne comprennent pas certains mots
      if (texte.includes("happy")){
        compteur += 1; //compteur pour voir si tous les clients ont été concertés
        liste = texte.split(' ');
        let reponse = liste[1];
        if (reponse == 'non'){
          compteurHappy -= 1;
          socket.write("exclude "+ nombre.toString()); //reprend l'index du mot choisi
          continuer = jeu.reinitializeFromChoice();
          if (continuer == false){
            socket.write('nouvellecarte'); //dans le cas où personne ne comprend aucun des 5 mots, prend une nouvelle carte
            carte = jeu.pickWords();
          };
        };
        if (compteur == compteurHappy){ //si tout les clients ont été concertés
          if (compteurHappy == compteurClient){ //si tout le monde est content
            socket.write('indice? ' + jeu.getChosenWord()); //demander à envoyer l'indice
          };
        };        
      };

      // si on reçoit des mots à faire deviner, les renvoyer à jeu.js
      if (texte.includes("mot")){
        liste = texte.split(' ');
        let fini = jeu.addClue(liste[1]);
// ETAPE 3 ////////////////////////////////////////////////////////////////////////////////////////////
        // si on a bien reçu tous les indices de tout le monde
        if (fini == true){
          let indices = jeu.getFinalClues(); //renvoie liste d'indices
          socketJoueurActif.write("réponse? "+ indices.toString());
        };
      };
// ETAPE 4 ////////////////////////////////////////////////////////////////////////////////////////////
      if (texte.includes("guess")){
        // récupère le résultat si le joueur est correct ou pas
        let resultat = jeu.handleGuess(texte);
        if (resultat == true){
          score = jeu.getScore();
          for (let cle of Object.keys(clients)){
            cle[1].write("score ",score);
            jeu.initializeRound();
          };
        }
        else if (resultat == null){
          score = getScore();
          for (let cle of Object.keys(clients)){
            cle[1].write("score ",score);
            jeu.initializeRound();
          };
        }
        else {
          score = jeu.getScore();
          for (let cle of Object.keys(clients)){
            cle[1].write("score ",score);
            jeu.initializeRound();
          };
        };
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
*/
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