$(function() {
    var index = 0;
    var entorno_actual = 'local';
    var url_tipo = 'base';

    function loadJS(url, callback) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    loadJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Urls.js', function() {
        // Maneja el evento de envío del formulario del chat.
        $("#chat-form").submit(function(e) {
            e.preventDefault();
            var msg = $("#chat-input").val();
            if (msg.trim() == '') {
                return false;
            }

            // Envía el mensaje a la API REST en localhost.
            $.ajax({
                url: get_url(entorno_actual, url_tipo),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ contenido: msg }),
                success: function(response) {
                    // Genera el mensaje en el chat como propio ('self').
                    generate_message(response.contenido, 'self', response.timestamp);
                    console.log('Mensaje enviado:', response);

                    // Guarda el mensaje enviado en localStorage.
                    saveMessageToLocalStorage(response.contenido, 'self', formatearFecha(response.timestamp));

                    setTimeout(function() {
                        // Genera el mensaje duplicado en el chat.
                        generate_message(response.contenido, 'user', response.timestamp);
                        // Retraso de 1 segundo antes de mostrar el mensaje duplicado.
                        saveMessageToLocalStorage(response.contenido, 'user', formatearFecha(response.timestamp));
                    }, 1000);
                },
                error: function(xhr, status, error) {
                    console.error('Error al enviar mensaje:', error);
                    // Genera un mensaje de error en el chat.
                    generate_message("Error al enviar mensaje", 'user', new Date().toLocaleString());

                    // Guarda el mensaje de error en localStorage.
                    //saveMessageToLocalStorage("Error al enviar mensaje", 'user', new Date().toLocaleString());
                }
            });
        });

        // Función para generar un mensaje en el chat.
        function generate_message(msg, type, time) {
            index++;
            var str = "";
            // Selecciona el avatar según el tipo de mensaje ('self' o 'user').
            var senderAvatarUrl = (type === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Ecom.png";

            // Construye el HTML del mensaje.
            str += "<div id='cm-msg-" + index + "' class=\"chat-msg " + type + "\">";
            str += "          <span class=\"msg-avatar\">";
            str += "            <img src=\"" + senderAvatarUrl + "\">";
            str += "          </span>";
            str += "          <div class=\"cm-msg-text\">";
            str += msg;
            str += "            <div class=\"timestamp\">" + time + "</div>";
            str += "          </div>";
            str += "        </div>";

            $(".chat-logs").append(str);
            $("#cm-msg-" + index).hide().fadeIn(300);
            if (type == 'self') {
                $("#chat-input").val('');
            }
            $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
        }

        // Función para guardar mensajes en Local Storage.
        function saveMessageToLocalStorage(msg, type, time) {
            var messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
            messages.push({ msg: msg, type: type, timestamp: time });
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }

        // Función para cargar mensajes desde Local Storage.
        function loadMessagesFromLocalStorage() {
            var messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
            messages.forEach(function(message) {
                generate_message(message.msg, message.type, message.timestamp);
            });
        }

        // Función para formatear la fecha
        function formatearFecha(fecha) {
            // Crear un objeto de fecha a partir de la cadena
            var date = new Date(dateString);

            // Obtener las partes de la fecha
            var day = String(date.getDate()).padStart(2, '0'); // Día del mes (con dos dígitos)
            var month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (comienza desde 0)
            var year = date.getFullYear(); // Año
            var hours = String(date.getHours()).padStart(2, '0'); // Hora (con dos dígitos)
            var minutes = String(date.getMinutes()).padStart(2, '0'); // Minutos (con dos dígitos)
            var seconds = String(date.getSeconds()).padStart(2, '0'); // Segundos (con dos dígitos)

            // Formato deseado: DD/MM/YYYY HH:mm:ss
            var formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

            return formattedDate;
        }

        // Maneja el evento de clic en el botón de alternar la visibilidad de la caja del chat.
        $(document).on("click", ".chat-box-toggle", function() {
            $(".chat-box").toggle('scale', function() {
                if (!$(".chat-box").is(':visible')) {
                    $("#chat-circle").show('scale');
                }
            });
        });

        // Maneja el evento de clic en el círculo del chat.
        $("#chat-circle").click(function() {
            $("#chat-circle").hide('scale');
            $(".chat-box").show('scale');
        });

        // Cargar mensajes desde Local Storage al iniciar la página.
        loadMessagesFromLocalStorage();
    });
});