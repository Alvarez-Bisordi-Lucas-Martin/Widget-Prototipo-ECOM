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
        // Credenciales del constructor
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.app_name = app_name;
        this.flujo_id = flujo_id;
        this.metadata = JSON.stringify(metadata);

        // Credenciales del primer response
        this.token = null;
        this.sesion_id = null;
        this.parametros = null;

        // Validadores
        this.valid = false;
        this.primer_mensaje = true;

        // Urls
        this.url_static = get_url_static();

        // Contenedores
        this.container = containerId;
        this.chatbotWidget = null;
        this.chatbotBubble = null;
        this.chatbotContainer = null;
    }

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
            
            const css = [
                this.url_static + 'css/widget_chatbot.css'
            ];
            this.cargarCSS(css, () => {
                this.crear_html();
                this.chatbotBubble.style.display = 'flex';
                this.chatbotContainer.style.display = 'none';
            });
        });
    }

    validate() {
        if (!document.getElementById(this.container)) {
            console.error(`Container con ID: "${this.container}", no encontrado`);
            return;
        }
        this.container = document.getElementById(this.container);

        console.log("*********************** WIDGET DATA ***********************");
        console.log(" ");
        console.log("Client ID: " + this.client_id);
        console.log("Client Secret: " + this.client_secret);
        console.log("App Name: " + this.app_name);
        console.log("Flujo ID: " + this.flujo_id);
        console.log("Metadata: " + this.metadata);
        console.log("Imports URL Base: " + this.url_static);
        console.log(" ");
        console.log("************************ RESPONSES ************************");
        console.log(" ");

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
        this.chatbotBubble.innerHTML = `
        <div class="help-text">
            <p>¡PROBAR CHATBOT!</p>
        </div>
        <div class="icon">
            <img src="${this.url_static}images/chatbot.svg" alt="Chatbot Icon">
        </div>
        `;
        this.chatbotWidget.appendChild(this.chatbotBubble);

        // Crear el contenedor del chatbot
        this.chatbotContainer = document.createElement('div');
        this.chatbotContainer.id = 'chatbot-container';
        this.chatbotContainer.innerHTML = `
            <div id="chatbot-header">
                <span id="chatbot-title">ERROR DE ACTIVACION</span>
                <span id="chatbot-close">
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </g>
                    </svg>
                </span>
            </div>
            <div id="chatbot-body"></div>
            <div id="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="Escribe un mensaje..." autocomplete="off"/>
                <button id="chatbot-send">
                    <img src="${this.url_static}images/send.svg" alt="Enviar Icon">
                </button>
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

    openChat() {
        if (this.primer_mensaje && this.valid) {
            document.getElementById("chatbot-input").disabled = true;
            // Mensaje Chatbot
            this.obtenerRespuestaAPI();
        }
        else if (this.primer_mensaje && !this.valid) {
            document.getElementById("chatbot-input").disabled = true;

            setTimeout(() => {
                // Mensaje Chatbot Error
                this.addMessage({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'bot');
                document.getElementById("chatbot-input").disabled = false;
                document.getElementById("chatbot-input").focus();
            }, 1000);

            this.primer_mensaje = false;
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
        else {
            setTimeout(() => {
                // Mensaje Chatbot Error
                this.addMessage({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'bot');
                document.getElementById("chatbot-input").disabled = false;
                document.getElementById("chatbot-input").focus();
            }, 1000);
        }

        // Limpiar campo de entrada
        inputField.value = '';
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        
        var bot = (this.valid) ? `${this.url_static}images/bot_valid.png` : `${this.url_static}images/bot_error.png`;
        var imagen = (sender === 'user') ? `${this.url_static}images/perfil.png` : bot;
        let messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar"></span>`;

        // Crear contenedor para el contenido del mensaje
        messageContent += `<div class="message-content fr-view">${message.contenido}`;

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