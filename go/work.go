package main

import "fmt"

type Input struct {
	image  Image
	filter Filter
	y_min  uint
	y_max  uint
	fin    bool
}

type Output struct {
	image Image
	y_min uint
	y_max uint
}

func Work(input chan Input, output chan Output) {
	for {
		pb := <-input
		fmt.Println("COMMENCE LE TRAVAIL")
		if pb.fin {
			break
		}
		work := MakeImage(pb.image.Longueur, pb.y_max-pb.y_min, Color{0, 0, 0})
		var x, y uint
		pb.filter.PrepareImage(pb.image, pb.y_min, pb.y_max)
		for y = pb.y_min; y < pb.y_max; y++ {
			for x = 0; x < pb.image.Longueur; x++ {
				work.Data[(y-pb.y_min)*work.Longueur+x] = pb.filter.GetPixel(x, y, pb.image)
			}
		}
		output <- Output{work, pb.y_min, pb.y_max}
	}
}
