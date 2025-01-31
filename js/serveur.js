const net = require("net");

let compteurClient = 0;
let clients = {};

//fonction pour 
function lancement(compteurClient){
    for (let id of Object.keys(clients)) {
        let socket = clients[id];
        socket.write("Vous êtes le client numéro: ${id}\n");
    }

};

//boucle serveur de connexion au port
const server = net.createServer((socket) => {
  //affiche sur le terminal du serveur une connexion de <adresse ip> sur le port <port>, run à chaque fois qu'un client se connecte
  compteurClient += 1;
  clients[compteurClient] = socket; //numéro unique pour chaque client
  lancement(compteurClient);
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort);

  //s'exécute à chaque fois qu'on reçoit des données du client
  socket.on("data", (buffer) => {
    console.log("allo"); //affiche allo du côté du terminal du serveur
    socket.write(`${buffer.toString("utf-8").toUpperCase()}\n`); //écrit buffer en verr maj dans la console du client
  });

  //s'exécute quand un client ferme la connexion
  socket.on("end", () => {
    compteurClient -= 1;
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort);
  });

  socket.on("error", (err) => {
    console.error("Erreur sur le socket :", err.message);
  });
})

server.maxConnections = 7;
server.listen(9999);
//pour arrêter une connexion: socket.end("on peur dire qqchose ici")
