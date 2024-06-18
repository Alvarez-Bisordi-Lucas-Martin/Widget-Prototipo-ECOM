function widget(client_id, client_secret, app_name) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.app_name = app_name;
    
    this.start = function() {
        //Función para cargar un archivo JS.
        function loadJS(url, callback) {
            var script = document.createElement("script");
            script.src = url;
            script.onload = callback;
            document.head.appendChild(script);
        }
        
        //Función para cargar un archivo CSS.
        function loadCSS(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
        }

        //Carga la lista de aplicaciones y realizar la validación.
        loadJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/UsuariosValidados.js', function() {
            var validacion = false;
            
            if (typeof usuarios_validados !== 'undefined' && Array.isArray(usuarios_validados)) {
                validacion = usuarios_validados.some(usuario => usuario.client_id === client_id && usuario.client_secret === client_secret && usuario.app_name === app_name);
            }
            
            if (validacion) {
                //Carga el WidgetPrototipo.
                function createWidgetHTML() {
                    var widgetHTML = `
                        <div id="chat-circle" class="btn btn-raised">
                            <div id="chat-overlay"></div>
                            <i class="material-icons">chat</i>
                        </div>
                        <div class="chat-box">
                            <div class="chat-box-header">
                                ECOM IA - CHAT BOT
                                <span class="chat-box-toggle">
                                    <i class="material-icons">close</i>
                                </span>
                            </div>
                            <div class="chat-box-body">
                                <div class="chat-box-overlay"></div>
                                <div class="chat-logs"></div>
                            </div>
                            <div class="chat-input">
                                <form id="chat-form">
                                    <input type="text" id="chat-input" placeholder="Envía un mensaje..."/>
                                    <button type="submit" class="chat-submit" id="chat-submit">
                                        <i class="material-icons">send</i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    `;
                    var widgetContainer = document.getElementById("chatbot-container");
                    widgetContainer.innerHTML = widgetHTML;
                }
                
                loadJS('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.7/js/tether.min.js', function(){
                    loadCSS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/WidgetPrototipo.css');
                    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
                    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
                    loadCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
                    loadJS('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
                        loadJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js', function() {
                            loadJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/WidgetPrototipo.js', function(){
                                createWidgetHTML();
                            });
                        });
                    });
                });
            } else {
                //Carga el WidgetError.
                function createWidgetHTML() {
                    var widgetHTML = `
                        <div id="chat-circle" class="btn btn-raised">
                            <div id="chat-overlay"></div>
                            <i class="material-icons">feedback</i>
                        </div>
                        <div class="chat-box">
                            <div class="chat-box-header">
                                ERROR DE ACTIVACIÓN
                                <span class="chat-box-toggle">
                                    <i class="material-icons">close</i>
                                </span>
                            </div>
                            <div class="chat-box-body">
                                <div class="chat-box-overlay"></div>
                                <div class="chat-logs"></div>
                            </div>
                            <div class="chat-input">
                                <form id="chat-form">
                                    <input type="text" id="chat-input" placeholder="Envía un mensaje..."/>
                                    <button type="submit" class="chat-submit" id="chat-submit">
                                        <i class="material-icons">send</i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    `;
                    var widgetContainer = document.getElementById("chatbot-container");
                    widgetContainer.innerHTML = widgetHTML;
                }
                
                loadJS('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.7/js/tether.min.js', function(){
                    loadCSS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/WidgetError.css');
                    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
                    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
                    loadCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
                    loadJS('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
                        loadJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js', function() {
                            loadJS('https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/WidgetPrototipo/WidgetError.js', function(){
                                createWidgetHTML();
                            });
                        });
                    });
                });
            }
        });
    };
}