

// pour récupérer le nb de joueurs
console.log("Combien de joueurs êtes-vous?");
process.stdin.on('data',input=>{
    const nbJoueurs = input.toString().trim();
    client.write(guess+'\n');
});
