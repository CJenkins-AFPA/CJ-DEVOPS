# Secure Gateway using Official Hardened Image (Non-root)
FROM nginxinc/nginx-unprivileged:alpine

USER root
# Install curl for healthchecks if needed (alpine)
RUN apk add --no-cache curl

USER nginx

# Configure Nginx
COPY --chown=nginx:nginx infra/docker/gateway.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx infra/certs /etc/nginx/certs

# Permissions are already set for 'nginx' user in this image
EXPOSE 8443
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
