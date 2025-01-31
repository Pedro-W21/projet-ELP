
console.clear()
dico = 
console.log("Bienvenu dans le jeu JustOne!\n");
// pour récupérer le nb de joueurs
console.log("Combien de joueurs êtes-vous?");
process.stdin.on('data',input=>{
    const nbJoueurs = input.toString().trim(); // nombre de joueurs
    console.log("Très bien, ");
    client.write(guess+'\n');
});
