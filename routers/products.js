const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const { Product } = require('../models/product');
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate('category');
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

router.post(`/`, async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category);
  } catch (error) {
    res.status(400).send('Invalid Category');
  }

  let product = new Product({
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
  if (!product) return res.status(500).send('The category cannot be Updated!');
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
module.exports = router;
