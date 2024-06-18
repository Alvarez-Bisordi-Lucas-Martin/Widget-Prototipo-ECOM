$(function() {
    var INDEX = 0;
    var entorno_actual = 'local';
    var url_tipo = 'base';
    
    function loadJS(url, callback) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }
    
    loadJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Urls.js', function() {
        //Maneja el evento de envío del formulario del chat.
        $("#chat-form").submit(function(e) {
            e.preventDefault();
            var msg = $("#chat-input").val();
            if (msg.trim() == '') {
                return false;
            }
            //Genera el mensaje en el chat como propio ('self').
            generate_message(msg, 'self');
            
            //Envía el mensaje a la API REST en localhost.
            $.ajax({
                url: get_url(entorno_actual, url_tipo),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ contenido: msg }),
                success: function(response) {
                    console.log('Mensaje enviado:', response);
                    //Obtiene el ID del mensaje creado en la respuesta.
                    /*var idMensaje = response.id;
                    obtenerMensajeDuplicado(idMensaje);*/
                    setTimeout(function() {
                        //Genera el mensaje duplicado en el chat.
                        generate_message(response.contenido, 'user');
                        //Retraso de 1 segundo antes de mostrar el mensaje duplicado.
                    }, 1000);
                },
                error: function(xhr, status, error) {
                    console.error('Error al enviar mensaje:', error);
                }
            });
        });
        
        //Función para generar un mensaje en el chat.
        function generate_message(msg, type) {
            INDEX++;
            var str = "";
            //Selecciona el avatar según el tipo de mensaje ('self' o 'user').
            var senderAvatarUrl = (type === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Ecom.png";
            
            var timestamp = getFormattedDate();

            //Construye el HTML del mensaje.
            str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
            str += "          <span class=\"msg-avatar\">";
            str += "            <img src=\"" + senderAvatarUrl + "\">";
            str += "          </span>";
            str += "          <div class=\"cm-msg-text\">";
            str += msg;
            str += "            <div class=\"timestamp\">" + timestamp + "</div>";
            str += "          </div>";
            str += "        </div>";
            
            $(".chat-logs").append(str);
            $("#cm-msg-" + INDEX).hide().fadeIn(300);
            if (type == 'self') {
                $("#chat-input").val('');
            }
            $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
        }

        //Función para obtener el mensaje duplicado desde la API.
        /*function obtenerMensajeDuplicado(idMensaje) {
            $.ajax({
                url: get_url(entorno_actual, url_tipo) + idMensaje + '/',
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    console.log('Mensaje duplicado:', response);
                    setTimeout(function() {
                        //Genera el mensaje duplicado en el chat.
                        generate_message(response.contenido, 'user');
                        //Retraso de 1 segundo antes de mostrar el mensaje duplicado.
                    }, 1000);
                },
                error: function(xhr, status, error) {
                    console.error('Error al obtener mensaje duplicado:', error);
                }
            });
        }*/
        
        //Función para obtener la fecha y hora actual formateada.
        function getFormattedDate() {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            return `${day}/${month}/${year} ${hours}:${minutes}`;
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
});