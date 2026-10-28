FROM nginx:1.27-alpine
RUN apk add --no-cache openssl

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY 40-selfsigned.sh /docker-entrypoint.d/40-selfsigned.sh
# strip Windows line endings (CRLF) and make executable
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-selfsigned.sh \
    && chmod +x /docker-entrypoint.d/40-selfsigned.sh

EXPOSE 80 443
