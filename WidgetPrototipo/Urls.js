const valores_de_entorno = {
    "local": {
        "base": "http://localhost:8000/api/v1/mensajes/"
    },
    "test": {
        "base": "https://chatbot.ecomdev.ar/api/v1/mensajes/"
    },
    "produccion": {
        "base": "https://chatbot.ecom.com.ar/api/v1/mensajes/"
    }
};

function get_url(entorno, url_tipo) {
    return valores_de_entorno[entorno][url_tipo];
}