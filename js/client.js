const net = require('net');
const readline = require('readline');

const client = new net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.connect(3000, 'localhost', () => {
    console.log('Connecté au serveur');
    rl.question('Entrez votre nom: ', (name) => {
        client.write(name);
        startGame();
    });
});

function startGame() {
    rl.question('Appuyez sur Entrée pour continuer...', () => {
        client.write('ready');
    });
}

client.on('data', (data) => {
    const message = data.toString();
    console.log(message);
    if (message.includes('Indices finaux')) {
        rl.question('Devinez le mot: ', (guess) => {
            client.write(guess);
        });
    }
});

client.on('close', () => {
    console.log('Déconnecté du serveur');
    rl.close();
});
