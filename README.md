## Configuración de Credenciales

1. **Crea el archivo de configuración:**
   - Crea un archivo `config.js` en la carpeta src del proyecto con el siguiente contenido:

    ```javascript
    var config = {
        client_id: 'tu_client_id',
        client_secret: 'tu_client_secret',
        app_name: 'tu_app_name',
        flujo_id: 'tu_flujo_id',
        metadata: {
            'username': 'tu_username',
            'first_name': 'tu_first_name',
            'last_name': 'tu_last_name',
            'fecha_hora': new Date()
        },
        entorno_actual: 'local'
    };
    
    if (config.entorno_actual === 'local') {
    config['script_url'] = '../static/js/widget_chatbot.js'
    }
    else if (config.entorno_actual === 'test') {
        config['script_url'] = 'http://ecom-chatbot-widget.ecomdev.ar/js/widget_chatbot.js'
    }
    else {
        config['script_url'] = 'https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/js/widget_chatbot.js'
    }
    ```