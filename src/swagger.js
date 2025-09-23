const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Backend UMG",
            version: "1.0.0",
            description: "Documentación de la API para el proyecto UMG",
            contact: {
                name: "Equipo de Backend"
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: {type: "integer", example: 1},
                            name: {type: "string", example: "Juan Pérez"},
                            email: {type: "string", example: "juan@example.com"},
                            role: {type: "string", enum: ["USUARIO", "PROVEEDOR"], example: "USUARIO"},
                            telefono: {type: "string", example: "+50212345678"},
                            direccion: {type: "string", example: "Ciudad de Guatemala"}
                        }
                    },
                    Proveedor: {
                        type: "object",
                        properties: {
                            id: {type: "integer", example: 10},
                            nombreComercial: {type: "string", example: "Comercial XYZ"},
                            rfc: {type: "string", example: "RFC123456789"},
                            direccion: {type: "string", example: "Zona 1, Guatemala"},
                            latitud: {type: "number", example: 14.6349},
                            longitud: {type: "number", example: -90.5069},
                            telefono: {type: "string", example: "+50287654321"}
                        }
                    },
                    AuthResponse: {
                        type: "object",
                        properties: {
                            token: {type: "string", example: "jwt.token.aqui"},
                            user: {$ref: "#/components/schemas/User"},
                            proveedor: {$ref: "#/components/schemas/Proveedor"}
                        }
                    },
                    ErrorResponse: {
                        type: "object",
                        properties: {
                            error: { type: "string", example: "Mensaje de error" }
                        }
                    },
                }
            }
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {swaggerUi, swaggerDocs};