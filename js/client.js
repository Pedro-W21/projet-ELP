const net = require('net');             // Communication réseau (socket)
const readline = require('readline');   // Communication utilisateur (IHM)
// Init socket
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});

/**
 * Function to prompt the user to select a secret word by typing the corresponding number.
 * If the input is valid, it sends the selected number to the server.
 * If the input is invalid, it prompts the user again.
 */
function select() {
    console.log("\n______________________________________________________________");
    interface.question("\nChoisissez un des mots secrets en tapant le numéro correspondant : ", (number) => {
        if (number>0 && number<6) {
            client.write('number ' + number.toString());
        }
        else {
            console.log("\nVous ne savez pas compter de 1 à 5. Recommencez donc.");
            select();
        }
        console.log("\nLes autres joueurs tentent de comprendre le nouveau mot...");
        // console.log("\nTâche ardue, vous n'imaginez même pas à, quel point !");
    });
};

/**
 * Function to prompt the user to indicate readiness by pressing Enter.
 * Sends the readiness status to the server.
 */
function ready() {
    console.log("\n______________________________________________________________");
    client.write('ready ' + 'false');
    interface.question("\nLorsque vous serez prêts, appuyez sur Entrée pour lancer l'aventure...", () => {
        client.write('ready ' + 'true');
        console.log("\nLes autres joueurs ne sont pas encore prêts, profitez-en pour affuter votre esprit !");
    });
};

global.server_exists = true;
// Init client
const port = 9999
const client = net.createConnection(port, 'localhost', () => { //connecte au port choisi
    console.log("\n______________________________________________________________");
    // console.log("\nVotre bateau a échoué sur le port ", port, "...");
    console.log("\nConnecté au hub JustOne ", port, " !!!");
    interface.question("\nChoisissez le pseudonyme sous lequel sous voulez être connu : ", (pseudo) => {
        client.write('pseudo ' + pseudo); // Envoi du pseudo au serveur
        // console.log("\nVous dénommez désormais ", pseudo, ", félicitations ! ");
        ready();
    });
});  


// Event listeners
client.on('data', (msg) => { //écoute les données du serveur
    const msg_string = msg.toString(); //les convertit en msg_string
    // console.log(msg_string) //debug
    const msg_list = msg_string.split(' '); //les sépare par mot
    if (msg_string.includes('actif')) {
        console.log("\n______________________________________________________________");
        console.log("\nVous êtes le joueur actif !");
        console.log("\nUne carte de 5 mots secrets a été tirée au sort.");
        select();
    }
    if (msg_string.includes('passif')) {
        console.log("\n______________________________________________________________");
        console.log("\nVous n'êtes pas le joueur actif.");
        console.log("\nLe joueur actif est actuellement en train de tirer un mot secret au hasard.");
        // console.log("\nSoyez patient, il est un peu lent mais ce n'est pas de sa faute.");
    }
    if (msg_string.includes('happy?')) {
        console.log("\n______________________________________________________________");
        let mot = msg_list[1];
        console.log("\nLe mot tiré par le joueur actif est : ", mot);
        console.log("\nLe comprenenez-vous ?");
        interface.question("\nRépondez par oui ou non : ", (happy) => {
            client.write('happy ' + happy);
            console.log("\nOn vérifie que tout le monde a bien compris le mot secret...");
            // console.log("\nVous êtes pas le seul à vous plaindre, comprenez bien.");
        });
    }
    if (msg_string.includes('exclude')) {
        console.log("\n______________________________________________________________");
        console.log("\nLes autres joueurs ne comprennent pas trop le mot n°", msg_list[1], ", choisissez en un autre.");
        select();
    }
    if (msg_string.includes('nouvellecarte')) {
        console.log("\n______________________________________________________________");
        console.log("\nAucun mot de la carte précédente n'a été compris.");
        console.log("\nUne nouvelle carte de 5 mots secrets a été tirée au sort.");
        select();
    }
    if (msg_string.includes('indice?')) {
        console.log("\n______________________________________________________________");
        let mot = msg_list[1];
        console.log("\nLe mot tiré par le joueur actif est : ", mot);
        interface.question("\nEcrivez un indice en rapport avec ce mot pour le faire deviner au joueur actif : ", (indice) => {
            client.write('mot ' + indice);
            console.log("\nLe joueur actif essaie de deviner le mot secret...");
            // console.log("\nEh oui, il faut encore attendre XD");
        });
    }
    if (msg_string.includes('réponse?')) {
        console.log("\n______________________________________________________________");
        let indices_str = msg_string.slice(9);
        let indices = []
        if (indices_str.split(" ").length > 1) {
            indices = JSON.parse(indices_str)
        }
        else if (indices_str.split(" ").length > 0) {
            indices = [indices_str]
        }
        
        if (indices == [] || indices[0] == "" || indices[0] == " ") {
            console.log("\nAucun indice des autres joueurs n'est valide...");
            console.log("\nCe round est donc perdu.");
            // console.log("\nVous ferez mieux la prochaine fois, peut-être ;)");
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
        console.log("\n______________________________________________________________");
        let score = msg_list[1];
        console.log("\nLe joueur actif a deviné le mot secret, bravo à lui !");
        console.log("\nVous remportez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('score_pass')) {
        console.log("\n______________________________________________________________");
        let score = msg_list[1];
        console.log("\nLe joueur actif a passé ce tour, par manque d'indices...");
        console.log("\nVous perdez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('score_perdu')) {
        console.log("\n______________________________________________________________");
        let score = msg_list[1];
        console.log("\nLe joueur actif s'est trompé");
        console.log("\nVous perdez ce round, le score est désormais de ", score, "points.");
        ready();
    }
    if (msg_string.includes('fin')) {
        console.log("\n______________________________________________________________");
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
        interface.question("\nVoulez-vous rejoindre une autre partie ?", (rep) => {
            if (rep == 'oui') {
                ready();
            }
            else {
                client.end();
            }
        });    }
});


client.on("error", (err) => {
    global.server_exists = false;
    client.end()
})

// End
client.on('close', () => {
    if (global.server_exists) {
        console.log("\n______________________________________________________________");
        console.log("\nVous avez été éjecté de la partie");
        console.log("\nSi vous pensez que ce n'est pas normal, vous pouvez simplement relancer le jeu ;)");
    }
    
    interface.close();
    client.end()
});
