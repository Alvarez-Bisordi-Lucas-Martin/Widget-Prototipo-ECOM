# Etapa 1: Construcción de Python
# FROM --platform=linux/amd64 python:3.10.0 AS python

# ENV PYTHONUNBUFFERED 1
# ENV PYTHONDONTWRITEBYTECODE 1

# WORKDIR /apps

# RUN apt-get update && apt-get install -y \
#     binutils \
#     libproj-dev 

# RUN pip install --upgrade pip --no-cache-dir

# COPY . .

# RUN pip install -r requirements/base.txt

# RUN chmod +x ./entrypoint.sh
# ENTRYPOINT ["./entrypoint.sh"]

# Etapa 2: Minificación y ofuscación de archivos JS y CSS
FROM node:20.16.0-alpine AS minifier

RUN npm install -g terser cssnano-cli

COPY src/static /static

RUN terser /static/js/widget_chatbot.js -o /static/js/widget_chatbot.min.js -m -c && \
    rm -f /static/js/widget_chatbot.js && \
    cssnano /static/css/widget_chatbot.css /static/css/widget_chatbot.min.css && \
    rm -f /static/css/widget_chatbot.css

# Etapa 3: Imagen final con NGINX Proxy reverso
FROM nginx:alpine AS nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=minifier /static /usr/share/nginx/html
