package main

type Color struct {
	r uint8
	g uint8
	b uint8
}

type Image struct {
	data     []Color
	longueur uint
	hauteur  uint
}

func (i Image) GetAt(x uint, y uint) Color {
	return i.data[y*i.longueur+x]
}

func (i Image) PutAt(x uint, y uint, col Color) {
	i.data[y*i.longueur+x] = col
}

func MakeImage(longueur uint, hauteur uint, default_color Color) Image {
	i := Image{make([]Color, longueur*hauteur), longueur, hauteur}
	for x := 0; uint(x) < longueur; x++ {
		for y := 0; uint(y) < hauteur; y++ {
			i.PutAt(uint(x), uint(y), default_color)
		}
	}
	return i
}

func (i Image) CopyStripesFrom(other Image, start_y uint, end_y uint) {
	for y := start_y; y < end_y; y++ {
		for x := 0; uint(x) < i.longueur; x++ {
			i.PutAt(uint(x), y, other.GetAt(uint(x), y))
		}
	}
}
