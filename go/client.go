package main

import (
	"bufio"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"os"
)

func requete(chaine string, reader io.Reader) string {
	bufReader := reader.(*bufio.Reader) // Conversion de reader io.Reader en *bufio.Reader
	fmt.Print(chaine + " : \n")
	nom, _ := bufReader.ReadString('\n')
	return nom
}

func client() {
	/*

		//connexion au serveur
		var port int
		fmt.Print("Saisissez le port sur lequel vous voulez communiquer avec le serveur : \n")
		fmt.Scanln(&port)
		address := fmt.Sprintf("localhost:%d", port)
		conn, err := net.Dial("tcp", address)

		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		defer conn.Close() //pour être sûr que la connexion va se fermer
		fmt.Println("Connexion établie avec le serveur sur le port ", port)
	*/

	//création de demandes à l'utilisateur pour récoter les données
	var chemin string

	reader := bufio.NewReader(os.Stdin)
	chemin = requete("Entrez le chemin de l'image", reader)
	fmt.Printf(chemin)

	// aller à l'emplacement de l'image, lire les données et les récupérer sous forme de pixels entier 32 bits
	fichier, err := os.Open(chemin) //on ouvre l'image
	img, format, err := image.Decode(fichier)

	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	if format != "jpeg" && format != "png" {
		fmt.Println("Erreur, fichier pas en jpeg ou png")
		return
	}

	bound := img.Bounds()
	var hauteur, longueur int
	hauteur = bound.Max.Y - bound.Min.Y
	longueur = bound.Max.X - bound.Min.X
	fmt.Printf("l'image est de hauteur: %d et longueur: %d", hauteur, longueur)
	for i := bound.Max.X / 2; i < (bound.Max.X+10)/2; i++ {
		for j := bound.Max.Y / 2; j < (bound.Max.Y+10)/2; j++ {
			pixel := img.At(i, j)
			r, g, b, a := pixel.RGBA()
			fmt.Printf("Couleur du pixel (%d, %d) - R: %d, G: %d, B: %d, A: %d\n", i, j, r/256, g/256, b/256, a/256)
		}
	}
}

//envoi des données EN FORMAT JSON

/*code pour envoyer les données
_, err := conn.Write([]byte(json))

if err != nil {
	fmt.Println("Error:", err)
	return
}
*/
