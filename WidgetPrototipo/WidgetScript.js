(function() {
    function loadCSS(url) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function loadJS(url, callback) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

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
    
    loadJS('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.7/js/tether.min.js');

    loadCSS('WidgetPrototipo.css');
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
    loadCSS('https://fonts.googleapis.com/icon?family=Material+Icons');

    createWidgetHTML();
    
    loadJS('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
        loadJS('WidgetPrototipo.js');
    });
    loadJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js');
})();