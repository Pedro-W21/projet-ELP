package main

import (
	"fmt"
)

func main() {
	var image_test Image = MakeImage(1000, 1000, Color{0, 255, 0})
	fmt.Println(image_test.GetAt(200, 500))
}
