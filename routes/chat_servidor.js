var nicks = new Array();
var onlineClients = new Array();
var estatus = new Array();
var imgPerfil = new Array();
var io;

var emoji = require('emoji');

exports.iniciar = function(http)
{
	io = require('socket.io').listen(http);
	io.sockets.on('connection', function(socket){
		usuarios(socket);
		nick(socket);
		mensaje(socket);		
		buscar(socket);
		mensajePrivado(socket);
		estados(socket);	
		imagenPerfil(socket);
		envioArchivos(socket);
		usuario_desconectado(socket);
	});
}

function usuarios(socket)
{	
	socket.emit('usuarios', {nicks: nicks, estatus: estatus, imgPerfil: imgPerfil});
	socket.broadcast.emit('usuarios', {nicks: nicks, estatus: estatus, imgPerfil: imgPerfil});
}

function nick(socket)
{
	socket.on('nick', function(data)
	{
		var nick = data.nick;
		if(nicks.indexOf(nick) == -1)
		{
			nicks.push(nick);
			onlineClients.push(socket.id); 
			estatus.push("disponible");
			imgPerfil.push("http://localhost:3000/images/default.jpg");
			socket.nick = nick;
			socket.emit('nick', {correcto: true, nick: nick});
			socket.broadcast.emit('nuevo_usuario', {nick: nick});
			usuarios(socket);
		}else
		{
			socket.emit('nick', {correcto: false, nick: nick});
		}
	});
}

function mensaje(socket)
{
	socket.on('mensaje', function(data)
	{
		if(socket.nick)
		{
			var mensaje = data.mensaje;
			var nick = socket.nick;
			socket.broadcast.emit('mensaje', {mensaje: mensaje, nick: nick});				
		}		
	});
}

function buscar(socket)
{
	socket.on('buscar',function(data)
	{
		var nick = data.nick;
		var msg = data.msg;

		if(nicks.indexOf(nick) != -1)
		{
			socket.emit('crearMensaje', {existe: true, msg: msg, nick: nick});
		}else
		{
			socket.emit('crearMensaje', {existe: false, nick: nick});
		}
	});

}

function mensajePrivado(socket)
{
	socket.on('privateMessage', function(data)
	{
		if(socket.nick)
		{
			var msg = data.msg;
			var nickFrom = data.nick;
			var nickTo = socket.nick;

			var id = nicks.indexOf(nickFrom);
			id = onlineClients[id];
			
			socket.broadcast.to(id).emit('privateMessage', {msg: msg, nick: nickTo});
		}
	});
}

function estados(socket)
{
	socket.on('estados', function(data)
	{		
		var nick = socket.nick;
		var index = nicks.indexOf(nick);
		var estado = data.estado;
		
		estatus[index] = estado;

		usuarios(socket);
	});
}

function imagenPerfil(socket)
{
	socket.on('imagenPerfil', function(data)
	{
		var src = data.src;
		var nick = socket.nick;
		var index = nicks.indexOf(nick);

		imgPerfil[index] = src;

		usuarios(socket);
	});
}

function envioArchivos(socket)
{
	socket.on('envioArchivos', function(data)
	{
		if(socket.nick)
		{
			var src = data.src;	    
			//var mensaje = data.mensaje;
			var nick = socket.nick;
			socket.broadcast.emit('archivos', {src: src, nick: nick});
		}		
	});
}

function usuario_desconectado(socket)
{
	socket.on('disconnect', function()
	{
		if(socket.nick)
		{
			nicks.splice(nicks.indexOf(socket.nick), 1);
			socket.broadcast.emit('disconnect', {nick: socket.nick});
			usuarios(socket);
		}
    });	
}