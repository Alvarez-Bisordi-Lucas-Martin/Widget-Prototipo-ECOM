$(function() {
    var index = 0;

    //Maneja el evento de envío del formulario del chat.
    $("#chat-form").submit(function(e) {
        e.preventDefault();
        var contenido = $("#chat-input").val();
        var contenido_error = ("Para obtener asistencia, comunícate con el soporte técnico de Ecom");
        if (contenido.trim() == '') {
            return false;
        }
        //Genera el mensaje en el chat como propio ('self').
        generarMensaje(contenido, 'self');
        //Simula la respuesta del usuario después de 1 segundo.
        setTimeout(function() {
            generarMensaje(contenido_error, 'user');
        }, 1000);
    });

    //Función para generar un mensaje en el chat.
    function generarMensaje(contenido, tipo) {
        index++;
        var str = "";
        //Selecciona el avatar según el tipo de mensaje ('self' o 'user').
        var perfil_imagen = (tipo === 'self') ? "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Perfil.jpg" : "https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/Images/Ecom.png";
        
        var fecha = formatearFecha(new Date());

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