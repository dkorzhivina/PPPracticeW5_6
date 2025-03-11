const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

// Добавляем middleware для админ панели
app.use(express.static('admin_public'));

// Чтение и запись в файл с товарами
const productsFile = path.join(__dirname, 'data', 'products.json');
const readProducts = () => JSON.parse(fs.readFileSync(productsFile, 'utf8'));
const writeProducts = data => fs.writeFileSync(productsFile, JSON.stringify(data, null, 2));

// API: Получить все товары
app.get('/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});

// API: Добавить товары (один или массив)
app.post('/products', (req, res) => {
    const products = readProducts();
    let newProducts = Array.isArray(req.body) ? req.body : [req.body];
    newProducts = newProducts.map(p => Object.assign({ id: products.length + 1 }, p));
    const updated = products.concat(newProducts);
    writeProducts(updated);
    res.status(201).json(newProducts);
});

// API: Обновить товар по ID
app.put('/products/:id', (req, res) => {
    let products = readProducts();
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };
    writeProducts(products);
    res.json(products[index]);
});

// API: Удалить товар по ID
app.delete('/products/:id', (req, res) => {
    let products = readProducts();
    const id = parseInt(req.params.id);
    const newProducts = products.filter(p => p.id !== id);
    if(newProducts.length === products.length){
      return res.status(404).json({ message: 'Product not found' });
    }
    writeProducts(newProducts);
    res.status(204).send();
});

// Swagger для панели администратора
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Admin API',
            version: '1.0.0',
            description: 'API панели администратора для управления товарами',
        },
        servers: [{ url: 'http://localhost:8080' }],
    },
    apis: ['admin-swagger.yaml'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.log("Admin server is running on http://localhost:" + PORT);
});
