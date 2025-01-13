package main

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
	PrepareImage(image Image, y_min uint, y_max uint)
}

type Gaussian struct {
	Strength float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
	return Color{0, 0, 0}
}

func (g Gaussian) PrepareImage(image Image, y_min uint, y_max uint) {

}

type Negatif struct {
	Strength float32
}

func (g Negatif) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := (255-float32(color.R))*g.Strength + float32(color.R)*(1-g.Strength)
	green := (255-float32(color.G))*g.Strength + float32(color.G)*(1-g.Strength)
	blue := (255-float32(color.B))*g.Strength + float32(color.B)*(1-g.Strength)
	return Color{uint8(red), uint8(green), uint8(blue)}
}

type Froid struct {
	Strength float32
}

func (g Froid) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * (1 - g.Strength)
	green := float32(color.G) * (1 - g.Strength)
	blue := float32(color.B) * (1 + g.Strength)
	if blue > 255 {
		blue = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}

type Chaud struct {
	Strength float32
}

func (g Chaud) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * (1 + g.Strength)
	green := float32(color.G) * (1 + g.Strength/2)
	blue := float32(color.B) * (1 - g.Strength)
	if red > 255 {
		red = 255
	}
	if green > 255 {
		green = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}

type Luminosite struct {
	Strength float32
}

func (g Luminosite) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * g.Strength
	green := float32(color.G) * g.Strength
	blue := float32(color.B) * g.Strength
	if red > 255 {
		red = 255
	}
	if green > 255 {
		green = 255
	}
	if blue > 255 {
		blue = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}
