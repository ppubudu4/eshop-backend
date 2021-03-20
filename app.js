const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

//cors
app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;

const productRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

//routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

//db connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database',
  })
  .then(() => {
    console.log('Database Connection Ready');
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(9000, () => {
  console.log('server is running http://localhost:9000');
});
