const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const { Product } = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, fileName + '-' + Date.now());
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  // http://localhost:9000/api/v1/products?categories=6085d9dd865165061c6c4349
  //filtering part
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }
  const productList = await Product.find(filter).populate('category');

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

//special get only need
router.get(`/name`, async (req, res) => {
  const productList = await Product.find().select('name brand image -_id');
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productList);
});

// populate  using to fill the category items
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    res
      .status(500)
      .json({ message: 'The product with given ID was not found' });
  }
  res.status(200).send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category);
  } catch (error) {
    res.status(400).send('Invalid Category');
  }

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //"http://localhost:3000/public/uploads/img-22222"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send('The product cannot be created');

  res.send(product);
});

router.put('/:id', async (req, res) => {
  //validate if product id is real
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product ID');
  }

  try {
    const category = await Category.findById(req.body.category);
    if (!category);
  } catch (error) {
    res.status(400).send('Invalid Category');
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) return res.status(500).send('The product cannot be Updated!');
  res.send(product);
});

router.delete('/:id', async (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'The product is deleted' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get('/get/count', async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.get('/get/featured/:count', async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

module.exports = router;
