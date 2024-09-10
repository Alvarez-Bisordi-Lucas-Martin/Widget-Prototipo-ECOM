$(function() {
    var index = 0;
    var entorno_actual = 'local';
    var sesion_id;
    var parametros;
    var primer_mensaje = true;

    // Función para crear el delay
    function delay(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Carga el primer mensaje al hacer click en el widget
    $("#chat-circle").click(function(e) {
        e.preventDefault();
        
        if (primer_mensaje && script.valid) {
            $("#chat-input").prop("disabled", true);
            // Mensaje Chatbot
            obtenerRespuestaAPI();
        }
        else if (primer_mensaje && !script.valid) {
            $("#chat-input").prop("disabled", true);

            setTimeout(function() {
                // Mensaje Chatbot Error
                generarMensaje({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'user');
            }, 1000);
            
            $("#chat-input").prop("disabled", false);
            $("#chat-input").focus();

            primer_mensaje = false;
        }
        else {
            $("#chat-input").focus();
        }
    });

    // Carga el mensaje que envia el usuario y la respuesta que obtiene de la API
    $("#chat-form").submit(function(e) {
        e.preventDefault();
        var contenido = $("#chat-input").val();
        if (contenido.trim() == '') {
            $("#chat-input").focus();
            return false;
        }
        $("#chat-input").prop("disabled", true);

        // Mensaje Usuario
        generarMensaje({ contenido: contenido, fecha_hora: new Date() }, 'self');

        // Mensaje Chatbot
        if (script.valid) {
            obtenerRespuestaAPI(contenido);
        }
        else {
            setTimeout(function() {
                // Mensaje Chatbot Error
                generarMensaje({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'user');
            }, 1000);
            
            $("#chat-input").prop("disabled", false);
            $("#chat-input").focus();
        }
    });

    // Función para obtener la respusta del Chatbot
    async function obtenerRespuestaAPI(contenido=null) {
        try {
            var bodyData;
            if (primer_mensaje) {
                bodyData = JSON.stringify({
                    flujo_id: script.flujo_id,
                    metadata: JSON.stringify(script.metadata),
                    app_name: script.app_name
                });
            } else {
                bodyData = JSON.stringify({
                    flujo_id: script.flujo_id,
                    sesion_id: sesion_id,
                    mensaje: contenido,
                    app_name: script.app_name
                });
            }
            const response = await fetch(get_url_conversacion(entorno_actual), {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + script.token,
                    'Content-Type': 'application/json'
                },
                body: bodyData
            }).then(response => response.json());

            if (response.status) {
                console.log(response);

                for (let mensaje of response.data.mensajes) {
                    await delay(mensaje.delay * 1000);
                    // Mensaje Chatbot
                    generarMensaje(mensaje, 'user');
                }

                if (primer_mensaje) {
                    parametros = response.data.parametros;
                    sesion_id = response.data.sesion_id;
                    primer_mensaje = false;
                    modificarTituloWidget(parametros.titulo_chatbot);
                }
            } else {
                console.error(response);
                // Genera un mensaje de error en el chat
                generarMensaje({ contenido: response.message, fecha_hora: new Date() }, 'user');
            }
        } catch (error) {
            console.error('Error al obtener el mensaje:', error);
            // Genera un mensaje de error en el chat
            generarMensaje({ contenido: "Error al obtener el mensaje", fecha_hora: new Date() }, 'user');
        }

        $("#chat-input").prop("disabled", false);
        $("#chat-input").focus();
    }
    
    // Función para generar un mensaje en el chat
    function generarMensaje(mensaje, tipo) {
        index++;
        var str = "";
        var i = 1;
        // Selecciona el avatar según el tipo de mensaje ('self' o 'user')
        var perfil_imagen = (tipo === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/images/Ecom.png";
        
        // Construye el HTML del mensaje
        str += "<div id='cm-msg-" + index + "' class=\"chat-msg " + tipo + "\">";
        str += "  <span class=\"msg-avatar\">";
        str += "    <img src=\"" + perfil_imagen + "\">";
        str += "  </span>";
        str += "  <div class=\"cm-msg-text fr-element fr-view\">";
        str += mensaje.contenido;
        
        // Agrega las opciones si estan disponibles
        if (mensaje.opciones) {
            for (let opcion of mensaje.opciones) {
                str += "<br>" + opcion.orden + ". " + opcion.mensaje;
            }
        }

        // Agrega la imagen si está disponible
        if (mensaje.adjunto) {
            str += "<div class=\"media\">";
            str += "  <img src='" + mensaje.adjunto + "' alt='Imagen' class='img-fluid mt-2 rounded' style='max-width: 200px; height: auto;'>";
            str += "</div>";
        }

        str += "  <div class=\"timestamp\">" + formatearFecha(mensaje.fecha_hora) + "</div>";
        str += "</div>";
        str += "</div>";

        // Agrega el mensaje al chat y maneja la animación y el scroll
        $(".chat-logs").append(str);
        $("#cm-msg-" + index).hide().fadeIn(300);
        if (tipo == 'self') {
            $("#chat-input").val('');
        }
        $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    }

    // Función para obtener la fecha y hora actual formateada
    function formatearFecha(fecha) {
        if (!(fecha instanceof Date)) {
            fecha = new Date(fecha);
        }
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    // Maneja el evento de clic en el botón de alternar la visibilidad de la caja del chat
    $(document).on("click", ".chat-box-toggle", function() {
        $(".chat-box").toggle('scale', function() {
            if (!$(".chat-box").is(':visible')) {
                $("#chat-circle").show('scale');
            }
        });
    });

    // Maneja el evento de clic en el círculo del chat
    $("#chat-circle").click(function() {
        $("#chat-circle").hide('scale');
        $(".chat-box").show('scale');
    });

    // Función para modificar el titulo del Chatbot
    function modificarTituloWidget(nuevo_titulo) {
        var header = document.querySelector('.chat-box-header');
        if (header) {
            header.firstChild.textContent = nuevo_titulo;
        }
    }
});
