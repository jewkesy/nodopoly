var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var net = require('net');

var gameServer = {
	createServer: function (config) {

		var emitter = new EventEmitter();

		var onSocketConnection = function (socket){
			emitter.emit('client connection', socket);
		};

		var onSocketError = function (err) {
			emitter.emit('error', err);
		}

		return {
			on: function (event, fn){
				emitter.on(event, fn);
			},
			start: function (){
				console.log('Starting game server')
				if(config.httpServer != null) {
					var io = require('socket.io').listen(config.httpServer);
					io.set('log level', 1); // reduce logging
					io.sockets.on('connection', onSocketConnection);
				}
				if (config.tcpServer != null && config.tcpPort != null) {
					var server = net.Server();
					server.on('connection', onSocketConnection);

					server.on('listening', function () {
						console.log('Server is now listening ' + config.tcpServer + ':' + config.tcpPort);
					});

					server.listen(config.tcpPort, config.tcpHost);
					server.on('error', onSocketError);
					if (config.verbose) console.log('listening on net')
				}
			}
		};
	},

	createManager: function () {
		var emitter = new EventEmitter();
		var clients = [];

		var getFreeID = function () {
			var id = 1;
			while(_.where(clients, {id: id}).length > 0) {
				id++;
			}
			return id;
		};

		var mgr = {
			on: function (event, fn){
				emitter.on(event, fn);
			},
			add: function (client)
			{
				client.id = getFreeID();
				client.manager = mgr;

				client.broadcast = function (event, data){
					var others = _.filter(clients, function (current){
						return current.id != client.id;
					});

					_.each(others, function (current){
						current.emit(event, data);
					});
				};

				client.on('message', function (data){
					emitter.emit('client message', {
						client: client, 
						data: data
					});
				});

				client.on('disconnect', function (){
					emitter.emit('client disconnect', client);
				});

				clients.push(client);

				return client;
			}
		};

		return mgr;
	},

	transformSocket: function (socket) {

		var client = {};

		if (socket.id == null) {
			var emitter = new EventEmitter();

			socket.on('data', function (data){
				try {
					var parsed = JSON.parse(data);
					emitter.emit(parsed.event || 'data', parsed.data);
				}
				catch (err) {
					console.log('Error parsing data');
					console.log(err);
				}
			});

			socket.on('error', function (error){
				if (error.code === 'ECONNRESET'){
					emitter.emit('disconnect');
				}
			});

			socket.on('disconnect', function (data) {
				emitter.emit('disconnect');
			});

			client = {
				on: function (event, fn) {
					emitter.on(event, fn);
				},
				emit: function (event, data) {
					socket.write(JSON.stringify({
						event: event,
						data: data
					}));
				}
			};
		}
		else
		{
			client = {
				on: function (event, fn){
					socket.on(event, fn);
				},
				emit: function (event, data){
					socket.emit(event, data);
				}
			};
		}

		return client;
	}
};

module.exports = gameServer;