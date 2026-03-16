#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const PROJECTS_ROOT =
  process.env.PROJECTS_ROOT ||
  (existsSync("/projects") ? "/projects" : path.join(process.cwd(), "projects"));

const server = new McpServer({
  name: "BootstrapToolServerNpx",
  version: "1.0.0",
});

server.tool(
  "create-bootstrap-file",
  "Crea un archivo de configuracion inicial en el proyecto",
  {
    fileName: z.string().describe("Nombre del archivo (ej: bootstrap.java)"),
    content: z.string().describe("Contenido del archivo"),
    subDir: z.string().optional().describe("Subdirectorio opcional dentro de /projects"),
  },
  async ({ fileName, content, subDir }) => {
    try {
      const targetDir = subDir ? path.join(PROJECTS_ROOT, subDir) : PROJECTS_ROOT;
      const filePath = path.join(targetDir, fileName);

      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");

      return {
        content: [{ type: "text", text: `Archivo creado exitosamente en: ${filePath}` }],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error creando archivo: ${error.message}` }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
