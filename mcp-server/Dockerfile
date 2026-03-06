# Etapa de compilación
FROM registry.access.redhat.com/ubi8/nodejs-20 AS builder
WORKDIR /opt/app-root/src
COPY --chown=1001:0 package*.json ./
RUN npm ci
COPY --chown=1001:0 . .
RUN npm run build

# Etapa de ejecución
FROM registry.access.redhat.com/ubi8/nodejs-20-minimal
WORKDIR /opt/app-root/src
COPY --from=builder --chown=1001:0 /opt/app-root/src/dist ./dist
COPY --from=builder --chown=1001:0 /opt/app-root/src/node_modules ./node_modules
COPY --from=builder --chown=1001:0 /opt/app-root/src/package*.json ./

# Puerto que definimos en el código
EXPOSE 3000

# Ejecutar el servidor
CMD ["node", "dist/index.js"]