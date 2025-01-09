package main

import (
	"net"
)

type ClientData struct {
	connection         net.TCPConn
	client_id          uint
	last_request_id    uint
	requests_in_flight []ClientRequest
}

type ClientRequest struct {
	request_id      uint
	raw_request     string
	image           Image
	filter_name     string
	raw_filter_data Filter
}

type TCPServer struct {
	listener       net.TCPListener
	last_client_id uint
	connections    []ClientData
}

type ClientRequestResponse struct {
	final_image Image
	id          uint
}

type TCPServerSenderThread struct {
	client_data           ClientData
	finished_work_channel chan ClientRequestResponse
}
