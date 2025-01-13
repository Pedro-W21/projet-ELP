package main

import (
	"math"
)

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
	PrepareImage(image Image, y_min uint, y_max uint)
}

const GAUSSIAN_KERNEL_SIDE int = 7
const GAUSSIAN_KERNEL_OFFSET int = 3

type Gaussian struct {
	Strength     float32
	Kernel       []float32
	Kernel_total float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
	total_R := float32(0.0)
	total_G := float32(0.0)
	total_B := float32(0.0)
	for x_t := 0; x_t < GAUSSIAN_KERNEL_SIDE; x_t++ {
		for y_t := 0; y_t < GAUSSIAN_KERNEL_SIDE; y_t++ {
			col_calc := image.GetAtInfaillible(x_t+int(x)-GAUSSIAN_KERNEL_OFFSET, y_t+int(y)-GAUSSIAN_KERNEL_OFFSET)
			total_R += float32(col_calc.R) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
			total_G += float32(col_calc.G) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
			total_B += float32(col_calc.B) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
		}
	}
	return Color{uint8(total_R * g.Kernel_total), uint8(total_G * g.Kernel_total), uint8(total_B * g.Kernel_total)}
}

func (g Gaussian) PrepareImage(image Image, y_min uint, y_max uint) {
	g.Kernel = make([]float32, GAUSSIAN_KERNEL_SIDE*GAUSSIAN_KERNEL_SIDE)
	total := 0.0
	for x := 0; x < GAUSSIAN_KERNEL_SIDE; x++ {
		for y := 0; y < GAUSSIAN_KERNEL_SIDE; y++ {
			g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x] = float32((1.0 / (2.0 * math.Pi * math.Pow(float64(g.Strength), 2.0))) * math.Exp(-((math.Pow(float64(x-GAUSSIAN_KERNEL_OFFSET), 2.0) + math.Pow(float64(y-GAUSSIAN_KERNEL_OFFSET), 2.0)) / (2.0 * math.Pow(float64(g.Strength), 2.0)))))
			total += float64(g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x])
		}
	}
	g.Kernel_total = 1.0 / float32(total)
}

type Neg_Fondu struct {
	Strength float32
}

func (g Neg_Fondu) PrepareImage(image Image, y_min uint, y_max uint) {
}

func (g Neg_Fondu) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := (255 - color.R)
	green := (255 - color.G)
	blue := (255 - color.B)
	return Color{uint8(red), uint8(green), uint8(blue)}
}

type Froid struct {
	Strength float32
}

func (g Froid) PrepareImage(image Image, y_min uint, y_max uint) {
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

func (g Chaud) PrepareImage(image Image, y_min uint, y_max uint) {
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

func (g Luminosite) PrepareImage(image Image, y_min uint, y_max uint) {
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

type Flou struct {
	Strength float32
}

func (g Flou) PrepareImage(image Image, y_min uint, y_max uint) {
}

func (g Flou) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := (255-float32(color.R))*g.Strength + float32(color.R)*(1-g.Strength)
	green := (255-float32(color.G))*g.Strength + float32(color.G)*(1-g.Strength)
	blue := (255-float32(color.B))*g.Strength + float32(color.B)*(1-g.Strength)
	return Color{uint8(red), uint8(green), uint8(blue)}
}
