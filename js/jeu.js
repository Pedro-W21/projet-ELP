const fs = require('fs');

const words = fs.readFileSync('liste.de.mots.francais.frgut.txt', 'utf8').split('\n').map(word => word.trim()).filter(word => word.length > 0);
const words_set = new Set(words)

class Game {
    constructor(total_players) {
        this.word = this.pickWord();
        this.score = 0;
        this.remainingCards = 13;
        this.totalPlayers = total_players
        this.chosenWord = ""
        this.clues = []
        this.unhappyPlayers = 0
    }

    pickWords() {
        for (let i = 0; i<5; i++) {
            let index = this.pickWordIndex()
            word = words.splice(index, 1)[0]
            this.current_card[i] = word
        }
    }

    getCurrentCard() {
        return this.current_card
    }

    chooseWordFromCard(word_index) { // Index de 1 à 5, cette fonction fait la translation
        this.chosenWord = this.current_card[word_index - 1]
        return this.chosenWord
    }

    addClue(new_clue) {
        this.clues[this.clues.length] = new_clue
    }

    signalUnhappyPlayer() { // Return true si le nombre de joueurs qui veulent changer de carte est égal à max_players-1
        this.unhappyPlayers += 1
        return (this.unhappyPlayers == this.totalPlayers - 1)
    }

    getClues() {
        return this.clues
    }

    getFinalClues() { // renvoie la liste des indices finale
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

    initializeRound() {
        this.clues = []
        this.chosenWord = ""
        this.current_card = []
        this.unhappyPlayers = 0
    }

    getHiddenWord() {
        return this.word.split('').map(letter => (this.guessedLetters.has(letter) ? letter : '_')).join('');
    }

    handleGuess(guess) {

    }

    endGame(won) {
        this.socket.destroy();
    }
}