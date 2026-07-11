# Architecture
Have a central constant running t2micro EC2 instance that handles all websocket connections. Clients directly connect to it and send and receive hearts. It acts as authoritative server for all in events. It can implement rate limiting and aggregating data before broadcasting to clients. The central websocket server should also regularly flush updates to the redis cache with increments and also regularly update the database with the aggregated data for analytics (all done async).

### Images
Client will request presigned S3 URL from the API server to upload images. The server then notifies the websocket server to broadcast the image to all clients using metadata. 

or even better

S3

↓

Event

↓

Worker

↓

WebSocket Server

Now clients cannot fake successful uploads.

### Aggregation
If server receives multiple hearts from multiple clients rather then broadcasting them immediately, it aggregates them into a single message and broadcasts it to all clients. [count: 5, user_color: "#FF0000", count: 3, user_color: "#00FF00"]

### Redis
Consider if I actually need redis?


### websocket server
The server will be written in C++ for lower latency and better performance. Will implement rate limiting through leaky bucket algorithm.

## Reverse proxy
Rather than implementing TLS on the websocket server, we'll use a reverse proxy like Nginx or Caddy to handle TLS termination and forward requests to the websocket server.