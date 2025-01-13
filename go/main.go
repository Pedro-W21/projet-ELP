package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	var image_test Image = MakeImage(1000, 1000, Color{0, 255, 0})
	fmt.Println(image_test.GetAt(200, 500))
	reader := bufio.NewReader(os.Stdin)
	mode := requete("Mode de fonctionnement ?", reader)
	mode = strings.TrimSpace(mode)
	if mode == "client" {
		principale()
	} else {
		fmt.Println("Serveur lancé sur le port 8000")
		server()
	}

}
