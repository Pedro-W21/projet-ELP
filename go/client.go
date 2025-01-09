package main

import (
	"bufio"
	"encoding/gob"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net"
	"os"
	"strings"
)

// fonction pour demander une data à l'utilisateur
func requete(chaine string, reader io.Reader) string {
	bufReader := reader.(*bufio.Reader) // Conversion de reader io.Reader en *bufio.Reader
	fmt.Print(chaine + " : \n")
	nom, _ := bufReader.ReadString('\n')
	return nom
}

// fonction principale
func client() {
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

	//création de demandes à l'utilisateur pour récoter les données
	var chemin, filtre string
	reader := bufio.NewReader(os.Stdin)
	chemin = requete("Entrez le chemin de l'image", reader)
	chemin = strings.TrimSpace(chemin)

	// FAIRE FILTRE !!!!!!
	filtre = requete("Entrez le filtre que vous voulez appliquer à l'image", reader)
	filtre = strings.TrimSpace(filtre)

	// aller à l'emplacement de l'image, lire les données et les récupérer sous forme de pixels entier 32 bits
	fichier, err := os.Open(chemin)           //on ouvre l'image
	img, format, err := image.Decode(fichier) //le decode

	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	if format != "jpeg" && format != "png" {
		fmt.Println("Erreur, fichier pas en jpeg ou png")
		return
	}

	//récupère la taille
	bound := img.Bounds()
	var haut, long int
	haut = bound.Max.Y - bound.Min.Y
	long = bound.Max.X - bound.Min.X
	var hauteur uint = uint(haut)
	var longueur uint = uint(long)

	//à effacer
	//fmt.Printf("l'image est de hauteur: %d et longueur: %d", hauteur, longueur)

	//crée le struct à envoyer
	structCouleur := []Color{}
	for i := bound.Min.X; i <= bound.Max.X; i++ {
		for j := bound.Min.Y; j <= bound.Max.Y; j++ {
			pixel := img.At(i, j)
			r, g, b, a := pixel.RGBA()
			//ici convertir type de uint32 en uint8
			var R uint8 = uint8(r / 256)
			var G uint8 = uint8(g / 256)
			var B uint8 = uint8(b / 256)
			sousStructCouleur := Color{R, G, B}
			structCouleur = append(structCouleur, sousStructCouleur)
		}
	}
	structImage := Image{structCouleur, longueur, hauteur}
	structFiltre := Filter{GetPixel(,,structImage)} // x et y ???
	structAenvoyer := ClientRequest{1, structImage, structFiltre} //le request_id à changer (la 1e variable)

	//crée un nouveau encodeur pour envoyer
	nouveauEncodeur := gob.NewEncoder(conn)
	aEnvoyer := nouveauEncodeur.Encode(structAenvoyer)
	//code pour envoyer les données
	_, err := conn.Write([]byte(aEnvoyer))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	//code pour recevoir des données du serveur
	
}
