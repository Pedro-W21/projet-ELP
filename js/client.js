const net = require('net');             // Communication réseau (socket)
const readline = require('readline');   // Communication utilisateur (IHM)

              // Init socket
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
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



function ready() {
    interface.question("\nLorsque vous serez prêts, appuyez sur Entrée pour lancer l'aventure...", () => {
        client.write('ready ' + 'true');
        console.log("\nLes autres joueurs ne sont pas encore prêts, profitez-en pour affuter votre esprit !");
    });
};


const port = 9999
const client = net.createConnection(port, 'localhost', () => { //connecte au port choisi
    console.log("\nVotre bateau a échoué sur le port ", port, "...");
    interface.question("\nChoisissez le pseudonyme sous lequel sous voulez être connu : ", (pseudo) => {
        client.write('pseudo ' + pseudo); // Envoi du pseudo au serveur
        console.log("\nVous dénommez désormais ", pseudo, ", félicitations ! ");
        ready();
    });
});  


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
            console.log("\nOn vérifie que tout le monde a bien compris le mot secret...");
            console.log("\nVous êtes pas le seul à vous plaindre, comprenez bien.");
        });
    }
    if (msg_string.includes('exclude')) {
        console.log("\nLes autres joueurs ne comprennent pas trop le mot n°", msg_list[1], ", choisissez en un autre svp.");
        select();
    }
    if (msg_string.includes('nouvellecarte')) {
        console.log("\nAucun mot de la carte précédente n'a été compris.");
        console.log("\nUne nouvelle carte de 5 mots secrets a été tirée au sort.");
        select();
    }
    if (msg_string.includes('indice?')) {
        let mot = msg_list[1];
        console.log("\nLe mot tiré par le joueur actif est : ", mot);
        interface.question("\nEcrivez un indice en rapport avec ce mot pour le faire deviner au joueur actif : ", (indice) => {
            client.write('mot ' + indice);
            console.log("\nLe joueur actif essaie de deviner le mot secret...");
            console.log("\nEh oui, il faut encore attendre XD");
        });
    }
    if (msg_string.includes('réponse?')) {
        let indices_str = msg_string.slice(9);
        let indices = []
        if (indices_str.split(" ").length > 1) {
            indices = JSON.parse(indices_str)
        }
        else if (indices_str.split(" ").length > 0) {
            indices = [indices_str]
        }
        
        if (indices == []) {
            console.log("\nAucun indice des autres joueurs n'est valide, lol.");
            console.log("\nCe round est donc perdu...");
            console.log("\nVous ferez mieux la prochaine fois, peut-être ;)");
            client.write('guess PASS');
        }
        else {
            console.log("\nVoici les indices  valides des autres joueurs : ");
            for (let i = 0; i < indices.length; i++) {
                console.log("\nIndice n°", i+1, " : ", indices[i]);
            }
            interface.question("\nEntrez le mot secret, ou PASS pour passer ce tour : ", (guess) => {
                client.write('guess ' + guess);
            });
        }
    }
    if (msg_string.includes('score_gagne')) {
        let score = msg_list[1];
        console.log("\nLe joueur actif a deviné le mot secret, bravo à lui !");
        console.log("\nVous remportez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('score_pass')) {
        let score = msg_list[1];
        console.log("\nLe joueur actif a passé ce tour, par manque d'indices...");
        console.log("\nVous perdez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('score_perdu')) {
        let score = msg_list[1];
        console.log("\nLe joueur actif s'est trompé");
        console.log("\nVous perdez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('fin')) {
        let score = msg_list[1];
        console.log("\nToutes les cartes ont été jouées, la partie est terminée !");
        console.log("\nLe score final est de ", score, "points.");
        if (score == 13) {
            console.log("\nScore parfait! Y arriverez-vous encore?");
        }
        if (score == 12) {
            console.log("\nIncroyable! Vos amis doivent être impressionnés!");
        }
        if (score == 11) {
            console.log("\nGénial ! C'est un score qui se fête!");
        }
        if (score == 9 || score == 10) {
            console.log("\nWaouh, pas mal du tout!");
        }
        if (score == 7 || score == 8) {
            console.log("\nVous êtes dans la moyenne. Arriverez-vous à faire mieux?");
        }
        if (score == 4 || score == 5 || score == 6) {
            console.log("\nC'est un bon début. Réessayez!");
        }
        if (score == 0 || score == 1 || score == 2 || score == 3) {
            console.log("\nEssayez encore.");
        }
    }
});

client.on('close', () => {
    console.log("\nVous avez été éjecté de la partie (looser XD)");
    console.log("\nSi vous pensez que ce n'est pas normal, vous pouvez simplement relancer le jeu ;)");
    interface.close();
});
