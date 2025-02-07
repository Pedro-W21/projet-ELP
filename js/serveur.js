const net = require("net");       // Communication réseau (socket)
const game = require("./jeu.js")  // Importe la classe Game
// Variables globales
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


// Boucle serveur de connexion au port
const server = net.createServer((socket) => {
  if (!jeucommence) {
    let valeur_a = compteurClient
    clients[valeur_a] = [valeur_a, 'pseudo', false, false, socket]
    compteurClient += 1
    // console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);
    socket.on("data", (buffer) => {
      let texte = buffer.toString("utf-8");
      if (texte.includes("pseudo")){
          // console.log("NOUVEAU JOUEUR DE PSEUDO : " + texte.split(" ")[1])
          liste = texte.split(' ');
          clients[valeur_a][1] = liste[1]; //récupère le pseudo entré par le client
      }
      else if (texte.includes("ready")){
          liste = texte.split(' ');
          let booleen = (liste[1] == "true");
          clients[valeur_a][2] = booleen; //regarde si le client est ready ou pas
      };
      // Vérifie si tout le monde est prêt
      let compteurTemporaire = 0;
      for (let list of Object.values(clients)){
          if (list[2] == true){
              compteurTemporaire += 1;
          };
      };
      // Si tout le monde est prêt
  // ETAPE 1 //////////////////////////////////////////////////////////////////////////////////////////////
      if (compteurTemporaire == compteurClient && compteurClient > 1){
        if (jeucommence == false){
          jeu = new game(compteurClient);
          jeucommence = true;
        };
        // Choisir le joueur actif et demander quel mot de 1 à 5
        tour = round%compteurClient;
        if (!round_commence) {
          jeu.initializeRound()
          jeu.pickWords()
          socketJoueurActif = Object.keys(clients)[tour];
          for (let cles of Object.keys(clients)){
            // Définition du joueur actif et du reste
            if (cles == socketJoueurActif){
              clients[cles][4].write("actif");
            }
            else {
              clients[cles][4].write("passif");
            };
          };
          round_commence = true
        }
        // Récupère le nombre choisi par le joueur actif
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
        // Vérifie s'il y a des joueurs qui ne comprennent pas certains mots
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
        // Si on reçoit des mots à faire deviner, les renvoyer à jeu.js
        if (texte.includes("mot")){
          liste = texte.split(' ');
          let fini = jeu.addClue(liste[1].toLowerCase());
  // ETAPE 3 ////////////////////////////////////////////////////////////////////////////////////////////
          // Si on a bien reçu tous les indices de tout le monde
          if (fini == true){
            let indices = jeu.getFinalClues(); //renvoie liste d'indices
            clients[socketJoueurActif][4].write("réponse? "+ indices.toString());
          };
        };
  // ETAPE 4 ////////////////////////////////////////////////////////////////////////////////////////////
        if (texte.includes("guess")) {
        // Récupère le résultat si le joueur est correct ou pas
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
          compteurHappy = compteurClient - 1;
          compteur = 0;
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
        // console.log("Client errored out\n")
      }
      else {
        // console.log("Client left\n")
      }
    })
  }
  else {
    socket.write("deja_commence")
  }
});


server.maxConnections = 7;
server.listen(9999);
console.log("Serveur démarré sur le port 9999")

// Pour arrêter une connexion: socket.end("on peut dire qqchose ici")
