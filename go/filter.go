package main

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
}

type Gaussian struct {
	strength float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {

	return Color{0, 0, 0}
}
