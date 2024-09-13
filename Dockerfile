# FROM --platform=linux/amd64 python:3.10.0 AS python

# ENV PYTHONUNBUFFERED 1
# ENV PYTHONDONTWRITEBYTECODE 1

# WORKDIR /apps

# RUN apt-get update && apt-get install -y \
#   binutils \
#   libproj-dev 

# RUN pip install --upgrade pip --no-cache-dir

# COPY . .

# RUN pip install -r requirements/base.txt

# RUN chmod +x ./entrypoint.sh
# ENTRYPOINT ["./entrypoint.sh"]

#------------------- NGINX Proxy reverso -------------------#
FROM nginx:alpine AS nginx

COPY nginx.conf /etc/nginx/nginx.conf

COPY src/static /usr/share/nginx/html
