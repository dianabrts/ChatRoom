var socket = io.connect('http://localhost:3000');

//Recibir los usuarios conectados
socket.on('usuarios', function(data){
	var nicks = data.nicks;
	var estatus = data.estatus;
	var imgPerfil = data.imgPerfil;

	$("#usuarios").html('');
	for (var i=0; i< nicks.length; i++){
		if(estatus[i] ===  "disponible")
		{			
			var srcc = imgPerfil[i];
			$("#usuarios").append('<li style="color: #209900">' + '<img style="width:40px;height:40px" src="'+ srcc +'">' + nicks[i] + '</li>');			
		}else
		{
			if(estatus[i] ===  "desconectado")
			{
				var srcc = imgPerfil[i];
				$("#usuarios").append('<li style="color: #EE0A10">' + '<img style="width:40px;height:40px" src="'+ srcc +'">'+ nicks[i] + '</li>');
			}else
			{
				var srcc = imgPerfil[i];
				$("#usuarios").append('<li style="color: #D3630C">' + '<img style="width:40px;height:40px" src="'+ srcc +'">' + nicks[i] + '</li>');
			}
		}
	}
});

//Enviar el nick para registrarlo al chat
$("#form_nick [type='submit']").click(function(){
	var nick = $("#nick").val();
	socket.emit('nick',{nick: nick});
});

//Validar si existe o no el nick
socket.on('nick', function(data){
	if(data.correcto){
		$("#mensajes").append('<p style="color: #00f"> Bienvenido/a ' + data.nick + ' </p>').scrollTop($("#mensajes").height());
		$("#form_nick").hide();
		$("#titmens,#mensajes, #form_mensaje, #mensajesPrivados, #enviarMensaje, #estados, #contenedorImagen, #archivos").show();
	}else{
		alert('Ya existe el usuario con el nombre de: '+ data.nick);
	}
});

//Verificar cada vez que un usuario se conectados
socket.on('nuevo_usuario', function(data){
	$("#mensajes").append('<p style="color: #00f"> ' + data.nick + ' se ha conectado </p>').scrollTop($("#mensajes").height());
	$("#mensaje").val('');
});

//Enviamos los mensaje al servidor
$("#form_mensaje [type='submit']").click(function(){
	var mensaje = $("#mensaje").val();
	socket.emit('mensaje', {mensaje: mensaje});
	$("#mensajes").append('<p style="font-weight: bold;"> YO: ' + mensaje + ' </p>').scrollTop($("#mensajes").height());
	$("#mensaje").val('');
});

//Enviar el estado del usuario
$("#estados [type='submit']").click(function(){
	var e = document.getElementById("estado");
	var estado = e.options[e.selectedIndex].value;
	socket.emit('estados', {estado: estado});
});

//Validar que el usuario exista para enviar mensaje privado
$("#privates [type='submit']").click(function(){
	var nick = $("#username").val();
	var msg = $("#msg").val();
	socket.emit('buscar', {nick: nick, msg: msg});
	$("#username").val('');
	$("#msg").val('');
});

//crear Mensaje Privado
socket.on('crearMensaje',function(data){
	if(data.existe)
	{
		var nick = data.nick;
		var msg = data.msg;

		socket.emit('privateMessage', {nick: nick, msg: msg});
		$("#mensajesPrivados").append('<p style="font-weight: bold;"> YO: ' + msg + ' </p>').scrollTop($("#mensajes").height());
	}else
	{
		alert("No Existe un Usuario contectado con el nombre de: "+ data.nick);
	}
});

//Subir Imagen de Perfil
$("#upload-btn").click(function(){
	$('#upload-input').click();
});

//Obtener archivo de fileChooser 
$('#upload-input').on('change', function(input)
{
	var files = $(this).get(0).files;

	var reader = new FileReader();

	reader.onload = function(e)
	{
		//enviar archivo al server
		//obtener la ruta de la imagen a mostrar
		var src = e.target.result;

		socket.emit('imagenPerfil',{src: src});
    	
    	//cambiar la imagen del usuario del lado del cliente
    	$('#imagenPerfil')
            .attr('src', e.target.result)
            .width(100)
            .height(100);
    };  

    reader.readAsDataURL(files[0]);  
});

//Subir cualquier tipo de archivo
$("#enviarArchivo").click(function()
{
	$('#selectArchivo').click();
});

//Obtener archivo de fileChooser 
$('#selectArchivo').on('change', function(input)
{
	var files = $(this).get(0).files;

	var reader = new FileReader();

	reader.onload = function(e)
	{
		//enviar archivo al server
		//obtener la ruta de la imagen a mostrar
		var src = e.target.result;

		socket.emit('envioArchivos',{src: src});

		$("#mensajes").append('<p style="font-weight: bold;"> YO: </p> <img style="" src="'+src+'">').scrollTop($("#mensajes").height());
    };  

    reader.readAsDataURL(files[0]);  
	
});

//Espera mensajes privados nuevos del servidor
socket.on('privateMessage',function(data){
	$("#mensajesPrivados").append('<p> '+ data.nick + ': '+ data.msg + '</p>').scrollTop($("#mensajesPrivados").height());
});

//Espera mensajes privados nuevos del servidor
socket.on('archivos',function(data){
	$("#mensajes").append('<p> '+ data.nick + ': </p> <img src="'+data.src+'">').scrollTop($("#mensajesPrivados").height());
});

//Espera los mensajes nuevos del servidor
socket.on('mensaje', function(data){
	$("#mensajes").append('<p> '+ data.nick + ': '+ data.mensaje + '</p>').scrollTop($("#mensajes").height());
});

//Se dispara cada vez que el usuario se desconecta
socket.on('disconnect', function(data)
{
	$("#mensajes").append('<p style="color: #f00"> ' + data.nick + ' se ha desconectado </p>').scrollTop($("#mensajes").height());
});