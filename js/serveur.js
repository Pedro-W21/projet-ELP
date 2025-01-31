const net = require("net");

//boucle serveur
//connexion au port
const server = net.createServer((socket) => {
  //affiche sur le terminal du serveur une connexion de <adresse ip> sur le port <port>
  console.log("Connection from", socket.remoteAddress, "port", socket.remotePort)

  //s'exécute à chaque fois qu'on reçoit des données du client
  socket.on("data", (buffer) => {
    console.log("allo") //affiche du côté du terminal du serveur
    socket.write(`${buffer.toString("utf-8").toUpperCase()}\n`) //écrit buffer en verr maj dans la console du client
  })
  //s'exécute quand le client ferme la connexion
  socket.on("end", () => {
    console.log("Closed", socket.remoteAddress, "port", socket.remotePort)
  })
})

server.maxConnections = 7
server.listen(9999)