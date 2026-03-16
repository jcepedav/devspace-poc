# devspace-poc

POC para levantar un entorno de desarrollo en Red Hat Dev Spaces con:

- Un contenedor principal para desarrollo Java 21.
- Un sidecar Node.js que expone un servidor MCP por SSE.
- Automatización para registrar el MCP en la configuración de VS Code remoto.

## Estructura del proyecto

```text
devfile/
  devfile.yaml                 # Definición del workspace de Dev Spaces
mcp-server/
  Dockerfile                   # Imagen del servidor MCP
  package.json                 # Scripts y dependencias Node/TypeScript
  tsconfig.json                # Configuración TypeScript
  src/
    index.ts                   # Servidor MCP + transporte SSE
  projects/
    com/cliente/config/
      demo-config.java         # Archivo de ejemplo generado
```

## ¿Qué hace el servidor MCP?

El servidor definido en `mcp-server/src/index.ts` publica la herramienta:

- `create-bootstrap-file`

Esta herramienta permite crear archivos de bootstrap/configuración dentro del directorio de proyectos, recibiendo:

- `fileName`: nombre del archivo.
- `content`: contenido del archivo.
- `subDir` (opcional): subdirectorio dentro de la raíz de proyectos.

### Endpoints expuestos

- `GET /sse`: inicia la conexión SSE de MCP.
- `POST /messages`: canal de mensajes del transporte SSE.

Variables de entorno relevantes:

- `PORT` (default: `3000`)
- `PROJECTS_ROOT` (default: `/projects` si existe, o `./projects` en local)

## Ejecutar el MCP server en local

Requisitos:

- Node.js 20+
- npm

Pasos:

```bash
cd mcp-server
npm install
npm run build
npm start
```

Modo desarrollo (compilación en watch):

```bash
cd mcp-server
npm install
npm run dev
```

## Construcción con Docker

Desde `mcp-server/`:

```bash
docker build -t mcp-server:local .
docker run --rm -p 3000:3000 -e PORT=3000 -e PROJECTS_ROOT=/projects mcp-server:local
```

## Dev Spaces

El archivo `devfile/devfile.yaml` define:

- Componente `java-runtime`: entorno principal con Java 21.
- Componente `mcp-server-sidecar`: sidecar con el servidor MCP y endpoint interno en puerto 3000.
- Comando `auto-configure-mcp`: inyecta la configuración del servidor MCP en la ruta de configuración de VS Code remoto.

Al iniciar el workspace, el evento `postStart` ejecuta automáticamente `auto-configure-mcp`.

## Dependencias principales

En `mcp-server/package.json`:

- `@modelcontextprotocol/sdk`
- `express`
- `zod`
- `typescript` (dev)

Para ejecutar en Devspaces Sandobox usar la sigueinte URL:

https://devspaces.apps.rm3.7wse.p1.openshiftapps.com/#https://github.com/jcepedav/devspace-poc/tree/main/devfile

## Autor

- juank1400@gmail.com

