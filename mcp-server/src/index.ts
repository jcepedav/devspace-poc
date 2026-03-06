import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const PORT = process.env.PORT || 3000;
const PROJECTS_ROOT =
  process.env.PROJECTS_ROOT ||
  (existsSync("/projects") ? "/projects" : path.join(process.cwd(), "projects"));

// 1. Crear el servidor MCP
const server = new McpServer({
  name: "BootstrapToolServer",
  version: "1.0.0",
});

// 2. Definir la herramienta para crear archivos
server.tool(
  "create-bootstrap-file",
  "Crea un archivo de configuración inicial en el proyecto",
  {
    fileName: z.string().describe("Nombre del archivo (ej: bootstrap.java)"),
    content: z.string().describe("Contenido del archivo"),
    subDir: z.string().optional().describe("Subdirectorio opcional dentro de /projects")
  },
  async ({ fileName, content, subDir }) => {
    try {
      const targetDir = subDir ? path.join(PROJECTS_ROOT, subDir) : PROJECTS_ROOT;
      const filePath = path.join(targetDir, fileName);

      // Asegurar que el directorio existe
      await fs.mkdir(targetDir, { recursive: true });
      
      // Escribir el archivo
      await fs.writeFile(filePath, content, "utf-8");

      return {
        content: [{ type: "text", text: `Archivo creado exitosamente en: ${filePath}` }]
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error creando archivo: ${error.message}` }]
      };
    }
  }
);

// 3. Configurar Express para el transporte SSE
const app = express();
let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  console.log("Nueva conexión SSE iniciada");
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("Transporte no inicializado. Conéctate primero a /sse");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor MCP (SSE) escuchando en puerto ${PORT}`);
  console.log(`Endpoint SSE: http://localhost:${PORT}/sse`);
});