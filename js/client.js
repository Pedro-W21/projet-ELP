const net = require('net');             // Communication réseau (socket)
const readline = require('readline');   // Communication utilisateur (IHM)

              // Init socket
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});


const port = 9999
const client = net.createConnection(port, 'localhost', () => { //connecte au port choisi
    console.log("\nVotre bateau a échoué sur le port ", port, "...");
    interface.question("\nChoisissez le pseudonyme sous lequel sous voulez être connu : ", (pseudo) => {
        client.write('pseudo ' + pseudo) // Envoi du pseudo au serveur
        console.log("\nVous dénommez désormais ", pseudo, ", félicitations ! ")
        interface.question("\nLorsque vous serez prêts, appuyez sur Entrée pour lancer l'aventure...", () => {
            client.write('ready ' + 'true')
            console.log("\nLes autres joueurs ne sont pas encore prêts, profitez-en pour affuter votre esprit !")
        })
    })
    
});  

function select() {
    interface.question("\nChoisissez un des mots secrets en tapant le numéro correspondant : ", (number) => {
        if (number>0 && number<6) {
            client.write('number ' + number.toString());
        }
        else {
            console.log("\nVous ne savez pas compter de 1 à 5. Recommencez donc.");
            select();
        }
    });
    console.log("\nLes autres joueurs tentent de comprendre le nouveau mot...");
    console.log("\nTâche ardue, vous n'imaginez même pas à, quel point !");
};


client.on('data', (msg) => { //écoute les données du serveur
    const msg_string = msg.toString(); //les convertit en msg_string
    console.log(msg_string)
    const msg_list = msg_string.split(' '); //les sépare par mot
    if (msg_string.includes('actif')) {
        console.log("\nVous êtes le joueur actif, trop bien !");
        console.log("\nUne carte de 5 mots secrets a été tirée au sort.");
        select();
    }
    if (msg_string.includes('passif')) {
        console.log("\nVous n'êtes pas le joueur actif, trop bien !");
        console.log("\nLe joueur actif est actuellement en train de tirer un mot secret au hasard.");
        console.log("\nSoyez patient, il est un peu lent mais ce n'est pas de sa faute.");
    }
    if (msg_string.includes('happy?')) {
        let mot = msg_list[1];
        console.log("\nLe mot tiré par le joueur actif est : ", mot);
        console.log("\nLe comprenenez-vous ?");
        interface.question("\nRépondez par oui ou non : ", (happy) => {
            client.write('happy ' + happy);
        });
        console.log("\nOn vérifie que tout le monde a bien compris le mot secret...");
        console.log("\nVous êtes pas le seul à vous plaindre, comprenez bien.");
    }
    if (msg_string.includes('exclude')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n°", msg_list[1], ", choisissez en un autre svp.");
        select();
    }
    if (msg_string.includes('indice?')) {
        let mot = msg_list[1];
        console.log("\nLe mot tiré par le joueur actif est : ", mot);
        interface.question("\nEcrivez un indice en rapport pour le faire deviner au joueur actif : ", (indice) => {
            client.write('mot ' + indice);
            console.log("\nLe joueur actif essaie de deviner le mot secret...");
            console.log("\nEh oui, il faut encore attendre XD");
        });
    }
    if (msg_string.includes('réponse?')) {
        let indices = msg_string.slice(9);
        console.log("\nLes autres joueurs vous proposent les indices : " + indices);
        interface.question("\nQuel est votre réponse ? : ", (mot_ecrit) => {
            client.write('guess ' + mot_ecrit);
        });
    }
});

client.on('close', () => {
    console.log("\nVous avez été éjecté de la partie (looser XD)");
    console.log("\nEn vrai tkt si c'est pas normal tu peux juste relancer le jeu ;)");
    interface.close();
});
