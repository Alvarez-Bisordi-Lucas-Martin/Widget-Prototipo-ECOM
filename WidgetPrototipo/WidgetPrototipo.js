$(function() {
    var index = 0;
    var entorno_actual = 'local';
    /*
    function cargarJS(url, callback) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    cargarJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Urls.js', function() {
        //Maneja el evento de envío del formulario del chat.
        $("#chat-form").submit(function(e) {
            e.preventDefault();
            var contenido = $("#chat-input").val();
            if (contenido.trim() == '') {
                return false;
            }

            //Envía el mensaje a la API REST en localhost.
            $.ajax({
                url: get_url_mensaje(entorno_actual),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ contenido: contenido }),
                success: function(response) {
                    console.log('Mensaje enviado:', response);
                    //Genera el mensaje en el chat como propio ('self').
                    generarMensaje(response.contenido, 'self', formatearFecha(response.timestamp));
                    //Simula la respuesta del usuario después de 1 segundo.
                    setTimeout(function() {
                        //Genera el mensaje duplicado en el chat.
                        generarMensaje(response.contenido, 'user', formatearFecha(response.timestamp));
                    }, 1000);
                },
                error: function(xhr, status, error) {
                    console.error('Error al enviar mensaje:', error);
                    //Genera un mensaje de error en el chat.
                    generarMensaje("Error al enviar mensaje", 'user', formatearFecha(new Date()));
                }
            });
        });

        //Función para generar un mensaje en el chat.
        function generarMensaje(contenido, tipo, fecha) {
            index++;
            var str = "";
            //Selecciona el avatar según el tipo de mensaje ('self' o 'user').
            var perfil_imagen = (tipo === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Ecom.png";

            //Construye el HTML del mensaje.
            str += "<div id='cm-msg-" + index + "' class=\"chat-msg " + tipo + "\">";
            str += "          <span class=\"msg-avatar\">";
            str += "            <img src=\"" + perfil_imagen + "\">";
            str += "          </span>";
            str += "          <div class=\"cm-msg-text\">";
            str += contenido;
            str += "            <div class=\"timestamp\">" + fecha + "</div>";
            str += "          </div>";
            str += "        </div>";

            $(".chat-logs").append(str);
            $("#cm-msg-" + index).hide().fadeIn(300);
            if (tipo == 'self') {
                $("#chat-input").val('');
            }
            $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
        }

        //Función para obtener la fecha y hora actual formateada.
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

        //Maneja el evento de clic en el botón de alternar la visibilidad de la caja del chat.
        $(document).on("click", ".chat-box-toggle", function() {
            $(".chat-box").toggle('scale', function() {
                if (!$(".chat-box").is(':visible')) {
                    $("#chat-circle").show('scale');
                }
            });
        });
        
        //Maneja el evento de clic en el círculo del chat.
        $("#chat-circle").click(function() {
            $("#chat-circle").hide('scale');
            $(".chat-box").show('scale');
        });
    });
    */
    //Maneja el evento de envío del formulario del chat.
    $("#chat-form").submit(function(e) {
        e.preventDefault();
        var contenido = $("#chat-input").val();
        if (contenido.trim() == '') {
            return false;
        }
        
        //Envía el mensaje a la API REST en localhost.
        $.ajax({
            url: get_url_mensaje(entorno_actual),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ contenido: contenido }),
            success: function(response) {
                console.log('Mensaje enviado:', response);
                //Genera el mensaje en el chat como propio ('self').
                generarMensaje(response.contenido, 'self', formatearFecha(response.timestamp));
                //Simula la respuesta del usuario después de 1 segundo.
                setTimeout(function() {
                    //Genera el mensaje duplicado en el chat.
                    generarMensaje(response.contenido, 'user', formatearFecha(response.timestamp));
                }, 1000);
            },
            error: function(xhr, status, error) {
                console.error('Error al enviar mensaje:', error);
                //Genera un mensaje de error en el chat.
                generarMensaje("Error al enviar mensaje", 'user', formatearFecha(new Date()));
            }
        });
    });

    //Función para generar un mensaje en el chat.
    function generarMensaje(contenido, tipo, fecha) {
        index++;
        var str = "";
        //Selecciona el avatar según el tipo de mensaje ('self' o 'user').
        var perfil_imagen = (tipo === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Ecom.png";

        //Construye el HTML del mensaje.
        str += "<div id='cm-msg-" + index + "' class=\"chat-msg " + tipo + "\">";
        str += "          <span class=\"msg-avatar\">";
        str += "            <img src=\"" + perfil_imagen + "\">";
        str += "          </span>";
        str += "          <div class=\"cm-msg-text\">";
        str += contenido;
        str += "            <div class=\"timestamp\">" + fecha + "</div>";
        str += "          </div>";
        str += "        </div>";

        $(".chat-logs").append(str);
        $("#cm-msg-" + index).hide().fadeIn(300);
        if (tipo == 'self') {
            $("#chat-input").val('');
        }
        $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    }

    //Función para obtener la fecha y hora actual formateada.
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

    //Maneja el evento de clic en el botón de alternar la visibilidad de la caja del chat.
    $(document).on("click", ".chat-box-toggle", function() {
        $(".chat-box").toggle('scale', function() {
            if (!$(".chat-box").is(':visible')) {
                $("#chat-circle").show('scale');
            }
        });
    });
    
    //Maneja el evento de clic en el círculo del chat.
    $("#chat-circle").click(function() {
        $("#chat-circle").hide('scale');
        $(".chat-box").show('scale');
    });
});