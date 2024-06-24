const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "스웨거 테스트",
      description: "Node.js Swagger swagger-jsdoc 방식 RestFull API 클라이언트",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routers/*.js", "./routers/user/*.js"],
};
const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, specs };
