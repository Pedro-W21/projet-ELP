

// pour récupérer le nb de joueurs
console.log("Combien de joueurs êtes-vous?");
a = 2;
process.stdin.on('data',input=>{
    const nbJoueurs = input.toString().trim();
    client.write(guess+'\n');
});
