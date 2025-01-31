const fs = require('fs');

const words = fs.readFileSync('liste.de.mots.francais.frgut.txt', 'utf8').split('\n').map(word => word.trim()).filter(word => word.length > 0);
const words_set = new Set(words)

class Game {
    constructor(total_players) { // Besoin de le construire 1 SEULE FOIS lorsque l'entité qui gère le jeu démarre
        this.current_card = []
        this.score = 0;
        this.remainingCards = 13;
        this.totalPlayers = total_players
        this.chosenWord = ""
        this.clues = []
        this.unhappyPlayers = 0
    }

    pickWords() { // crée la carte actuelle, renvoie 
        for (let i = 0; i<5; i++) {
            let index = this.pickWordIndex()
            word = words.splice(index, 1)[0]
            this.current_card[i] = word
        }
    }

    getCurrentCard() {
        return this.current_card
    }

    chooseWordFromCard(word_index) { // Index de 1 à 5, cette fonction fait la translation, à call avec le choix du joueur actif (fin de l'étape 1)
        this.chosenWord = this.current_card[word_index - 1]
        return this.chosenWord
    }

    addClue(new_clue) { // Return true si on a toutes les clues, à call pendant l'étape 2 avec les indices des joueurs non-actifs
        this.clues[this.clues.length] = new_clue
        return (this.clues.length == this.totalPlayers - 1)
    }

    signalUnhappyPlayer() { // Return true si le nombre de joueurs qui veulent changer de carte est égal à max_players-1, à call si un joueur demande à recommencer le round, et si ça return true c'est qu'il faut ! (pendant l'étape 2)
        this.unhappyPlayers += 1
        return (this.unhappyPlayers == this.totalPlayers - 1)
    }

    getClues() {
        return this.clues
    }

    getFinalClues() { // renvoie la liste des indices finale, à call une fois que toutes les clues sont reçues (addClue return true !) (à call dans l'étape 3)
        let final_clues = []
        for (let i = 0; i< this.clues.length; i++) {
            if (this.isClueValidAlone(this.clues[i]) || this.isClueUnique(i)) {
                final_clues[final_clues.length] = this.clues[i]
            }
        }
        return final_clues
    }

    isClueUnique(clue_index) { // return true si la Clue est unique dans la liste de clues

        tested_clue = this.clues[clue_index]
        for (let i = 0; i< this.clues.length; i++) {
            if (i != clue_index) {
                if (tested_clue == this.clues[i]) {
                    return false
                }
            }
        }
        return true

    }

    isClueValidAlone(tested_clue) { // Return true si la Clue reste
        return (words_set.has(tested_clue) && tested_clue != this.chosenWord)
    }

    pickWordIndex() {
        const index = Math.floor(Math.random() * words.length);
        return index
    }

    initializeRound() { // Call quand on (re)commence un round
        this.clues = []
        this.chosenWord = ""
        this.current_card = []
        this.unhappyPlayers = 0
    }

    getCardsLeft() { // Renvoie le nombre de cartes qu'il reste à jouer
        return this.remainingCards
    }

    isGameFinished() { // Return true si la partie est terminée, on peut relancer après ça mais c'est pas nécessaire
        return (this.remainingCards <= 0)
    }

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
