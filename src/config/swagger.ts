import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "user-api",
      version: "1.0.0",
      description: "Production REST API — JWT auth, Redis caching, MySQL",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
      { url: "https://api.webtechie.ir", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // where it looks for the JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
