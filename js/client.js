const net = require('net');             // Communication réseau (socket)
const readline = require('readline');   // Communication utilisateur (IHM)

const client = new net.Socket();                // Init socket
const interface = readline.createInterface({    // Init IHM
    input: process.stdin,
    output: process.stdout
});

const port = 9999

client.connect(port, 'localhost', () => { //connecte au port choisi
    console.log("\nVotre bateau a échoué sur le port ", port, "...");
    interface.question("\nChoisissez le pseudonyme sous lequel sous voulez être connu : ", (pseudo) => {
        client.write('pseudo ' + pseudo); // Envoi du pseudo au serveur
        console.log("\nVous dénommez désormais ", pseudo, ", félicitations ! ");
    });
    interface.question("\nLorsque vous serez prêts, appuyez sur Entrée pour lancer l'aventure...", () => {
        client.write('ready ' + 'true')
        console.log("\nLes autres joueurs ne sont pas encore prêts, profitez-en pour affuter votre esprit !");
    });
});

function actif() {
    interface.question("\nChoisissez un des mots secrets en tapant le numéro correspondant : ", (number) => {
        if (number>0 && number<6) {
            client.write('number' + number.toString());
        }
        else {
            console.log("\nVous ne savez pas compter de 1 à 5. Recommencez donc.");
            actif();
        }
    });
};

function passif(mot_choisi, retour) {
    if (retour) {
        console.log("\nLe mot choisi par le joueur actif est : ", mot_choisi);
        console.log("\nLe comprenenez-vous ?");
        interface.question("\nRépondez par oui ou non : ", (happy) => {
            client.write('happy ' + happy);
        });
    }
    else {
        console.log("\nLe mot choisi est : ", mot_choisi);
        interface.question("\nEcrivez un mot en rapport pour le faire deviner au joueur actif : ", (mot_ecrit) => {
            client.write('mot ' + mot_ecrit);
        });
    }
};

client.on('data', (data) => { //écoute les données du serveur
    const message = data.toString(); //les convertit en string
    if (message.includes('actif')) {
        console.log("\nVous êtes le joueur actif, trop bien !");
        console.log("\nUne carte de 5 mots secrets a été tirée au sort.");
        actif();
        //faire deviner le mot
    }
    if (message.includes('passif')) {
        console.log("\nVous n'êtes pas le joueur actif, trop bien !");
        //définir ici le mot choisi
        mot_choisi = 'mot_choisi'
        //définir ici s'il faut demander s'ils ont compris
        retour = false
        passif(mot_choisi, retour);
    }
    if (message.includes('pas_1')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n° 1, choisisez en un autre svp.");
        actif();
    }
    if (message.includes('pas_2')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n° 2, choisisez en un autre svp.");
        actif();
    }
    if (message.includes('pas_3')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n° 3, choisisez en un autre svp.");
        actif();
    }
    if (message.includes('pas_4')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n° 4, choisisez en un autre svp.");
        actif();
    }
    if (message.includes('pas_5')) {
        console.log("\nLes autres joueurs comprennent pas trop le mot n° 5, choisisez en un autre svp.");
        actif();
    }
});

client.on('close', () => {
    console.log("\nVous avez été éjecté de la partie (looser XD)");
    console.log("\nEn vrai tkt si c'est pas normal tu peux juste relancer le jeu ;)");
    interface.close();
});
