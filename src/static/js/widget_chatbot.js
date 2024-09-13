/************************************** URLS **************************************/

const valores_de_entorno = {
    "local": {
        "base": "http://127.0.0.1:8003/api/v1/",
        "static": "../static/"
    },
    "test": {
        "base": "https://chatbot.ecomdev.ar/api/v1/",
        "static": "https://ecom-chatbot-widget.ecomdev.ar/"
    },
    "produccion": {
        "base": "https://chatbot.ecom.com.ar/api/v1/",
        "static": "https://chatbot.ecom.com.ar/"
    }
};

var entorno_actual = "test";

if (typeof config !== "undefined" && config.entorno_actual) { entorno_actual = config.entorno_actual }

function get_url_base() {
    return valores_de_entorno[entorno_actual]["base"];
}

function get_url_static() {
    return valores_de_entorno[entorno_actual]["static"];
}

function get_url_token() {
    return get_url_base() + "aplicaciones/token/";
}

function get_url_conversacion() {
    return get_url_base() + "mensajes/conversacion/";
}

/************************************* CHATBOT *************************************/

class Chatbot {
    constructor(containerId, client_id, client_secret, app_name, flujo_id=null, metadata=null) {
        this.container = document.getElementById(containerId);
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.app_name = app_name;
        this.flujo_id = flujo_id;
        this.metadata = JSON.stringify(metadata);
        this.valid = false;
        this.url_static = 'https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/';
        this.token = null;
        this.sesion_id = null;
        this.parametros = null;
        this.primer_mensaje = true;
        this.chatbotWidget = null;
        this.chatbotBubble = null;
        this.chatbotContainer = null;

        if (!this.container) {
            console.error(`Container with id "${containerId}" not found.`);
            return;
        }
               
        this.chatbotBubble.style.display = 'none';
        this.chatbotContainer.style.display = 'none';
    }

    crear_html() {
        // Crea el contenedor del widget junto a su status
        this.chatbotWidget = document.createElement('div');
        this.chatbotWidget.id = 'chatbot-widget';
        if (this.valid) {
            this.chatbotWidget.setAttribute('data-status', 'valid');
        } else {
            this.chatbotWidget.setAttribute('data-status', 'invalid');
        }
        this.container.appendChild(this.chatbotWidget);

        // Crear el burbuja del chatbot
        this.chatbotBubble = document.createElement('div');
        this.chatbotBubble.id = 'chatbot-bubble';
        this.chatbotBubble.innerHTML = `<img src="https://img.icons8.com/ios-filled/50/ffffff/chat.png" alt="Chatbot Icon">`;
        this.chatbotWidget.appendChild(this.chatbotBubble);

        // Crear el contenedor del chatbot
        this.chatbotContainer = document.createElement('div');
        this.chatbotContainer.id = 'chatbot-container';
        this.chatbotContainer.innerHTML = `
            <div id="chatbot-header">
                <span id="chatbot-title">ERROR DE ACTIVACION</span>
                <span id="chatbot-close">&times;</span>
            </div>
            <div id="chatbot-body"></div>
            <div id="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="Escribe un mensaje..." autocomplete="off"/>
                <button id="chatbot-send">Enviar</button>
            </div>`;
        this.chatbotWidget.appendChild(this.chatbotContainer);
        
        // Agregar eventos
        this.chatbotBubble.addEventListener('click', this.openChat.bind(this));
        document.getElementById('chatbot-close').addEventListener('click', this.closeChat.bind(this));
        document.getElementById('chatbot-send').addEventListener('click', this.sendMessage.bind(this));

        // Evento para enviar mensaje al presionar Enter
        document.getElementById('chatbot-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    validate() {
        console.log("*********************** WIDGET DATA ***********************");
        console.log("Client ID: " + this.client_id);
        console.log("Client Secret: " + this.client_secret);
        console.log("App Name: " + this.app_name);
        console.log("Flujo ID: " + this.flujo_id);
        console.log("Metadata: " + this.metadata);
        console.log("Imports URL Base: " + this.url_static);
        console.log("************************ RESPONSES ************************");

        return fetch(get_url_token(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_name: this.app_name,
                client_id: this.client_id,
                client_secret: this.client_secret
            })
        })
        .then(response => response.json())
        .then(response => {
            if (response.status) {
                console.log(response);
                this.token = response.data.access_token;
                this.valid = true;
            } else {
                console.error(response);
            }
        })
        .catch(error => {
            console.error('Error al obtener token: ', error);
        });
    }

    openChat() {
        if (this.primer_mensaje && this.valid) {
            document.getElementById("chatbot-input").disabled = true;
            // Mensaje Chatbot
            this.obtenerRespuestaAPI();
        }
        else {
            document.getElementById("chatbot-input").focus();
        }

        this.chatbotContainer.style.display = 'flex';
        this.chatbotBubble.style.display = 'none';
    }

    closeChat() {
        this.chatbotContainer.style.display = 'none';
        this.chatbotBubble.style.display = 'flex';
    }

    sendMessage() {
        const inputField = document.getElementById('chatbot-input');
        const message = inputField.value.trim();
        if (message === '') return;
        document.getElementById("chatbot-input").disabled = true;

        // Mostrar mensaje del usuario
        this.addMessage({ contenido: message, fecha_hora: new Date() }, 'user');

        // Mostrar respuesta de la api
        if (this.valid) {
            this.obtenerRespuestaAPI(message);
        }

        // Limpiar campo de entrada
        inputField.value = '';
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        
        var imagen = (sender === 'user') ? `${this.url_static}images/perfil.jpg` : `${this.url_static}images/ecom.png`;
        let messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar"></span>`;

        // Crear contenedor para el contenido del mensaje
        messageContent += `<div class="message-content fr-element fr-view">${message.contenido}`;

        // Agrega las opciones si están disponibles
        if (message.opciones) {
            for (let opcion of message.opciones) {
                messageContent += `<br>${opcion.orden}. ${opcion.mensaje}`;
            }
        }

        // Agrega la imagen si está disponible
        if (message.adjunto) {
            messageContent += `
                <div class="media">
                    <img src="${message.adjunto}" alt="Imagen" class="img-fluid mt-2 rounded">
                </div>`;
        }
        
        messageContent += `  <div class="timestamp"> ${this.formatear_fecha(message.fecha_hora)} </div>`;

        // Cerrar el div del contenido
        messageContent += `</div>`;
    
        // Asignar el contenido al elemento
        messageElement.innerHTML = messageContent;
    
        // Añadir el nuevo mensaje al cuerpo del chat
        document.getElementById('chatbot-body').appendChild(messageElement);
    
        // Desplazarse hacia abajo al enviar mensaje
        const chatBody = document.getElementById('chatbot-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Función para cargar los archivos CSS
    cargarCSS(urls, callback) {
        var urls_cargadas = 0;
        
        urls.forEach(function(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            link.onload = function() {
                urls_cargadas++;
                if (urls_cargadas === urls.length) {
                    callback();
                }
            };
            document.head.appendChild(link);
        });
    }

    start() {
        this.validate().then(() => {
            this.crear_html();
            const css = [
                // CSS Externos
                this.url_static + 'vendors/froala/css/froala.css',
                // CSS Internos
                this.url_static + 'css/widget_chatbot.css'
            ];
            this.cargarCSS(css, () => {
                this.chatbotBubble.style.display = 'flex';
                this.chatbotContainer.style.display = 'none';
            });
        });
    }
    
    // Función para crear el delay
    delay(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Función para obtener la respusta del Chatbot
    async obtenerRespuestaAPI(contenido=null) {
        try {
            var bodyData;
            if (this.primer_mensaje) {
                bodyData = JSON.stringify({
                    flujo_id: this.flujo_id,
                    metadata: this.metadata,
                    app_name: this.app_name
                });
            } else {
                bodyData = JSON.stringify({
                    flujo_id: this.flujo_id,
                    sesion_id: this.sesion_id,
                    mensaje: contenido,
                    app_name: this.app_name
                });
            }
            const response = await fetch(get_url_conversacion(), {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.token,
                    'Content-Type': 'application/json'
                },
                body: bodyData
            }).then(response => response.json());

            if (response.status) {
                console.log(response);

                if (this.primer_mensaje) {
                    this.parametros = response.data.parametros;
                    this.sesion_id = response.data.sesion_id;
                    this.primer_mensaje = false;
                    this.modificar_titulo_widget();
                }

                for (let mensaje of response.data.mensajes) {
                    await this.delay(mensaje.delay * 1000);
                    // Mensaje Chatbot
                    this.addMessage(mensaje, 'bot');
                }
            } else {
                console.error(response);
                // Genera un mensaje de error en el chat
                this.addMessage({ contenido: response.message, fecha_hora: new Date() }, 'bot');
            }
        } catch (error) {
            console.error('Error al obtener el mensaje:', error);
            // Genera un mensaje de error en el chat
            this.addMessage({ contenido: "Error al obtener el mensaje", fecha_hora: new Date() }, 'bot');
        }

        document.getElementById("chatbot-input").disabled = false;
        document.getElementById("chatbot-input").focus();
    }

    // Función para obtener la fecha y hora actual formateada
    formatear_fecha(fecha) {
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

    // Función para modificar el titulo del Chatbot
    modificar_titulo_widget() {
        var title = document.querySelector('#chatbot-title');
        if (title) {
            title.textContent = this.parametros.titulo_chatbot;
        }
    }    
}
