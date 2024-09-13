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
    return get_url_base(entorno_actual) + "aplicaciones/token/";
}

function get_url_conversacion() {
    return get_url_base(entorno_actual) + "mensajes/conversacion/";
}

/************************************* SCRIPT *************************************/

var script = {
    app_name: null, flujo_id: null, metadata: null, token: null, valid: false, url_script: get_url_static()
}

function EcomWidget(client_id, client_secret, app_name, flujo_id=null, metadata=null) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.app_name = app_name;
    this.flujo_id = flujo_id;
    this.metadata = JSON.stringify(metadata);
    
    this.start = function() {
        // Función para cargar los archivos JS
        function cargarJS(urls, callback) {
            var scriptsCargados = 0;
            
            urls.forEach(function(url) {
                var script = document.createElement("script");
                script.src = url;
                script.onload = function() {
                    scriptsCargados++;
                    if (scriptsCargados === urls.length) {
                        callback();
                    }
                };
                document.head.appendChild(script);
            });
        }

        // Función para cargar los archivos CSS
        function cargarCSS(urls) {
            urls.forEach(function(url) {
                var link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = url;
                document.head.appendChild(link);
            });
        }

        console.log("*********************** WIDGET DATA ***********************");
        console.log("Client ID: " + this.client_id);
        console.log("Client Secret: " + this.client_secret);
        console.log("App Name: " + this.app_name);
        console.log("Flujo ID: " + this.flujo_id);
        console.log("Metadata: " + this.metadata);
        console.log("Imports URL Base: " + script.url_script);
        console.log("************************ RESPONSES ************************");

        fetch(get_url_token(), {
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
                script.token = response.data.access_token;
                script.valid = true;
                script.app_name = this.app_name;
                script.flujo_id = this.flujo_id;
                script.metadata = this.metadata;
                cargarWidgetPrototipo("valid");
            } else {
                console.error(response);
                cargarWidgetPrototipo("error");
            }
        })
        .catch(error => {
            console.error('Error al obtener token:', error);
            cargarWidgetPrototipo("error");
        });
        
        function crearWidgetHTML(tipo_widget) {
            return `
                <div class="widget-container" data-status="${tipo_widget}">
                    <div id="chat-circle" class="btn btn-raised">
                        <div id="chat-overlay"></div>
                        <i class="material-icons">chat</i>
                    </div>
                    <div class="chat-box">
                        <div class="chat-box-header">
                            ERROR DE ACTIVACION
                            <span class="chat-box-toggle">
                                <i class="material-icons">cancel</i>
                            </span>
                        </div>
                        <div class="chat-box-body">
                            <div class="chat-box-overlay"></div>
                            <div class="chat-logs"></div>
                        </div>
                        <div class="chat-input">
                            <form id="chat-form">
                                <input type="text" id="chat-input" placeholder="Envía un mensaje..." autocomplete="off"/>
                                <button type="submit" class="chat-submit" id="chat-submit">
                                    <i class="material-icons">send</i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function cargarWidgetPrototipo(tipo_widget) {
            const css = [
                // CSS Externos
                script.url_script + 'vendors/froala/css/froala_editor.css',
                script.url_script + 'vendors/froala/css/froala_style.css',
                // CSS Internos
                script.url_script + 'css/WidgetPrototipo.css'
            ];
            cargarCSS(css);

            const js = [
                // JS Externos
                script.url_script + 'vendors/tether/tether.min.js',
                script.url_script + 'vendors/jquery/jquery.min.js',
                script.url_script + 'vendors/bootstrap/bootstrap.min.js',
                script.url_script + 'vendors/froala/js/froala_editor.min.js',
                script.url_script + 'vendors/froala/js/plugins/link.min.js',
                // JS Internos
                script.url_script + 'js/WidgetPrototipo.js'
            ];
            cargarJS(js, function() {
                var widgetContainer = document.getElementById("chatbot-container");
                widgetContainer.innerHTML = crearWidgetHTML(tipo_widget);
            });
        }
    };
}