var config = {
    client_id: 'tixGF8JbWPuigMMDkYTFfL2tFSrIyqre2mP332j0',
    client_secret: 'pbkdf2_sha256$720000$6q1Ug2Y7C8S7PsAYD1MRPY$xadVS+y0mBErDvlY539JFMRJoeUZ75Og4vPmvzDG1Kg=',
    app_name: 'Turismo (Aplicación)',
    flujo_id: '28a28f32-3cf2-4a6a-807e-074cb445d170',
    metadata: {
        username: 'LucasBisordi',
        first_name: 'Lucas',
        last_name: 'Bisordi',
        fecha_hora: new Date()
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