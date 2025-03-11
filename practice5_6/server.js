const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Swagger для фронтенда (можно оставить или убрать)
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Storefront API',
            version: '1.0.0',
            description: 'API для получения товаров',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['openapi.yaml'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// API: Получение списка товаров
app.get('/api/products', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка чтения данных' });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log("Storefront server is running on http://localhost:" + PORT);
});
