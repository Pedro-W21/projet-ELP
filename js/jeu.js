const fs = require('fs');

//console.log(fs.readFileSync("DEM.jsonl", "utf-8").split("\n").length)
const words = fs.readFileSync("DEM.jsonl", "utf-8").split("\n").map(function(to_parse) {try {return JSON.parse(to_parse)} catch (e) {return {"M":"", "CA":{"catégorie":"a"}}}}).filter(dico => !dico["M"].includes(" ") && !dico["M"].includes("-") && ["N", "Adv", "Adj"].includes(dico["CA"]["catégorie"])).map((val) => val["M"])
//console.log(words_test)
// Load words from JSON file and filter out words containing spaces
//const words = JSON.parse(fs.readFileSync('dico.json', "utf8" )).filter(word => !word.includes(" "))
const words_set = new Set(words)


class Game {
    /**
     * Constructor for the Game class.
     * @param {number} total_players - Total number of players in the game.
     */
    constructor(total_players) { // Besoin de le construire 1 SEULE FOIS lorsque l'entité qui gère le jeu démarre
        this.currentCard = []
        this.score = 0;
        this.remainingCards = 13;
        this.totalPlayers = total_players
        this.chosenWord = ""
        this.clues = []
        this.unhappyPlayers = 0
        this.alreadyPickedCards = []
    }
    /**
     * Picks 5 random words from the list and sets them as the current card.
     */
    pickWords() { // crée la carte actuelle, renvoie 
        for (let i = 0; i<5; i++) {
            let index = this.pickWordIndex()
            let word = words.splice(index, 1)[0]
            this.currentCard[i] = word
        }
    }
    getCurrentCard() {
        return this.currentCard
    }
    /**
     * Chooses a word from the current card based on the given index.
     * @param {number} word_index - Index of the word to choose (1 to 5).
     * @returns {string} - The chosen word or an empty string if the word is not selectable.
     */
    chooseWordFromCard(word_index) { // Index de 1 à 5, cette fonction fait la translation, à call avec le choix du joueur actif (fin de l'étape 1), renvoie le mot choisi, ou "" si le mot n'est pas choisissable (un autre joueur a déjà dit non)
        this.chosenWord = this.currentCard[word_index - 1]
        if (this.alreadyPickedCards.indexOf(this.chosenWord) == -1) {
            return this.chosenWord
        }
        else {
            return ""
        }
    }
    /**
     * Adds a clue to the list of clues.
     * @param {string} new_clue - The clue to add.
     * @returns {boolean} - True if all clues have been received, false otherwise.
     */
    addClue(new_clue) { // Return true si on a toutes les clues, à call pendant l'étape 2 avec les indices des joueurs non-actifs
        this.clues[this.clues.length] = new_clue
        return (this.clues.length == this.totalPlayers - 1)
    }
    /**
     * Signals that a player is unhappy with the current word choice.
     * @returns {boolean} - True if the number of unhappy players equals totalPlayers - 1, false otherwise.
     */
    signalUnhappyPlayer() { // Return true si le nombre de joueurs qui veulent changer de carte est égal à max_players-1, à call si un joueur demande à recommencer le round, et si ça return true c'est qu'il faut ! (pendant l'étape 2)
        this.unhappyPlayers += 1
        return (this.unhappyPlayers == this.totalPlayers - 1)
    }
    getClues() {
        return this.clues
    }
    /**
     * Gets the final list of clues after filtering out invalid and duplicate clues.
     * @returns {Array} - The final list of clues.
     */
    getFinalClues() { // renvoie la liste des indices finale, à call une fois que toutes les clues sont reçues (addClue return true !) (à call dans l'étape 3)
        let final_clues = []
        for (let i = 0; i< this.clues.length; i++) {
            if (this.isClueValidAlone(this.clues[i]) && this.isClueUnique(i)) {
                final_clues[final_clues.length] = this.clues[i]
            }
        }
        return final_clues
    }
    /**
     * Checks if a clue is unique in the list of clues.
     * @param {number} clue_index - The index of the clue to check.
     * @returns {boolean} - True if the clue is unique, false otherwise.
     */
    isClueUnique(clue_index) { // return true si la Clue est unique dans la liste de clues
        let tested_clue = this.clues[clue_index]
        for (let i = 0; i< this.clues.length; i++) {
            if (i != clue_index) {
                if (tested_clue == this.clues[i]) {
                    return false
                }
            }
        }
        return true
    }
    /**
     * Checks if a clue is valid on its own.
     * @param {string} tested_clue - The clue to check.
     * @returns {boolean} - True if the clue is valid, false otherwise.
     */
    isClueValidAlone(tested_clue) { // Return true si la Clue reste
        return (words_set.has(tested_clue) && tested_clue != this.chosenWord)
    }
    /**
     * Picks a random index from the list of words.
     * @returns {number} - The random index.
     */
    pickWordIndex() {
        const index = Math.floor(Math.random() * words.length);
        return index
    }
    /**
     * Initializes a new round by resetting relevant attributes.
     */
    initializeRound() { // Call quand on (re)commence un round
        this.clues = []
        this.chosenWord = ""
        this.currentCard = []
        this.unhappyPlayers = 0
        this.alreadyPickedCards = []
    }
    /**
     * Reinitializes the round from the current choice.
     * @returns {boolean} - True if the round can continue, false otherwise.
     */
    reinitializeFromChoice() { // Call quand on recommence un round lorsqu'un joueur ne connaît pas le mot, renvoie true si le round peut continuer (il existe au moins 1 autre mot possible dans la carte)
        if (this.alreadyPickedCards.indexOf(this.chosenWord) == -1) {
            this.alreadyPickedCards[this.alreadyPickedCards.length] = this.chosenWord
            this.chosenWord = ""
            this.clues = []
            this.unhappyPlayers = 0
        }
        return (this.alreadyPickedCards.length < 5)
    }
    getCardsLeft() { // Renvoie le nombre de cartes qu'il reste à jouer
        return this.remainingCards
    }
    getScore() { // Renvoie le score actuel de l'équipe
        return this.score
    }
    getChosenWord() {
        return this.chosenWord
    }
    /**
     * Checks if the game is finished.
     * @returns {boolean} - True if the game is finished, false otherwise.
     */
    isGameFinished() { // Return true si la partie est terminée, on peut relancer après ça mais c'est pas nécessaire
        return (this.remainingCards <= 0)
    }
    /**
     * Handles the player's guess.
     * @param {string} guess - The player's guess.
     * @returns {boolean|null} - True if the guess is correct, false if incorrect, null if the player passes.
     */
    handleGuess(guess) { // return un booléen (true pour réussi, false pour perdu) ou null (si le joueur décide de PASS) et modifie les attributs nécessaires si besoin, à call avec le guess du joueur actif (dans l'étape 4)
        this.remainingCards -= 1
        if (guess == "PASS") {
            return null
        }
        else if (guess == this.chosenWord) {
            this.score += 1
            return true
        }
        else {
            // Implémenter de défausser la prochaine carte aussi
            return false
        }
    }
}


module.exports = Game
