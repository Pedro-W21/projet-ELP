package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	mode := requete("Choisissez votre mode de fonctionnement: entrez 'client' si vous voulez avoir l'interface client. Toute autre entrée lancera le mode serveur ", reader)
	mode = strings.TrimSpace(mode)
	if mode == "client" {
		principale()
	} else {
		fmt.Println("Serveur lancé sur le port 8000")
		server()
	}

}
