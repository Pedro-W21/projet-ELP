package main

import (
	"encoding/gob"
	"fmt"
	"net"
	"runtime"
)

type ClientData struct {
	connection         net.Conn
	decoder            gob.Decoder
	encoder            gob.Encoder
	last_request_id    uint
	requests_in_flight map[uint]ClientRequestResponse
}

type ClientRequest struct {
	Request_id  uint
	Sent_image  Image
	Filter_data Filter
}

type TCPServer struct {
	listener       net.Listener
	last_client_id uint
}

type ClientRequestResponse struct {
	Request_id          uint
	Final_image         Image
	Waiting_for_threads uint
}

type TCPServerSenderThread struct {
	client_data           ClientData
	finished_work_channel chan ClientRequestResponse
}

func MakeTCPServer(ip_and_port string) (TCPServer, error) {
	listener, err := net.Listen("tcp", ip_and_port)
	if err != nil {
		return TCPServer{listener, 0}, nil
	}
	return TCPServer{listener, 0}, err
}

func HandleClient(connection net.Conn) {
	client := ClientData{connection, *gob.NewDecoder(connection), *gob.NewEncoder(connection), 0, make(map[uint]ClientRequestResponse)}
	defer client.connection.Close()
	val := &ClientRequest{}
	total_cpu := runtime.NumCPU()
	input := make(chan Input)
	output := make(chan Output)
	for i := 0; i < total_cpu; i++ {
		go Work(input, output)
	}
	for {
		result := client.decoder.Decode(&val)
		if result == nil {

			for i := 0; i < total_cpu; i++ {
				input <- Input{val.Sent_image, val.Filter_data, uint(i * (int(val.Sent_image.Hauteur) / total_cpu)), uint((i + 1) * (int(val.Sent_image.Hauteur) / total_cpu)), false}
			}
			final := ClientRequestResponse{Request_id: val.Request_id, Final_image: MakeImage(val.Sent_image.Longueur, val.Sent_image.Hauteur, Color{0, 0, 0}), Waiting_for_threads: uint(total_cpu)}
			for i := 0; i < total_cpu; i++ {
				partiel := <-output
				final.Final_image.CopyStripesFrom(partiel.image, partiel.y_min, partiel.y_max)

			}
			client.encoder.Encode(&final)
			client.encoder = *gob.NewEncoder(connection)
			val = &ClientRequest{}
			client.decoder = *gob.NewDecoder(connection)
		} else {
			break
		}
	}
	for i := 0; i < total_cpu; i++ {
		input <- Input{fin: true}
	}
}

func (server TCPServer) listening_loop() {
	defer server.listener.Close()
	for {
		// Accept incoming connections
		conn, err := server.listener.Accept()
		if err != nil {
			fmt.Println("Error:", err)
			continue
		}

		// Handle client connection in a goroutine
		go HandleClient(conn)
	}
}

func server() {
	tcp_server, err := MakeTCPServer("localhost:8000")
	gob.Register(Gaussian{})
	gob.Register(Froid{})
	gob.Register(Flou_Fondu{})
	gob.Register(Neg_Fondu{})
	gob.Register(Chaud{})
	gob.Register(Luminosite{})
	gob.Register(Flou_moy{})
	gob.Register(Negatif{})
	gob.Register(Fourier{})
	if err != nil {
		fmt.Println("Erreur lors de la création du serveur : ", err)
	}
	tcp_server.listening_loop()
}
