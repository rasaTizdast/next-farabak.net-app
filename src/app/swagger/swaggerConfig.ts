import swaggerJsdoc, { OAS3Options } from "swagger-jsdoc";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Farabak.net Next.JS | API",
    version: "1.0.0",
    description: "API documentation for Farabak.net",
  },
  servers: [
    {
      url: "http://localhost:3000", // Adjust this URL for production
    },
  ],
};

const options: OAS3Options = {
  swaggerDefinition,
  apis: ["./src/app/api/**/*.ts",], // Path to your API routes for automatic documentation
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
