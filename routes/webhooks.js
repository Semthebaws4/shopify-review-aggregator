const express = require('express');
const router = express.Router();

// Webhook verification middleware
const verifyWebhook = (req, res, next) => {
  // In a real implementation, you would verify the webhook signature
  // using Shopify's webhook verification process
  next();
};

// Product created webhook
router.post('/products/create', verifyWebhook, (req, res) => {
  try {
    const product = req.body;
    console.log('Product created:', product.title);
    
    // Here you would typically:
    // 1. Store the product in your database
    // 2. Set up review monitoring for this product
    // 3. Trigger initial review aggregation
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Product create webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Product updated webhook
router.post('/products/update', verifyWebhook, (req, res) => {
  try {
    const product = req.body;
    console.log('Product updated:', product.title);
    
    // Here you would typically:
    // 1. Update the product in your database
    // 2. Re-aggregate reviews if product title changed
    // 3. Update any cached review data
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Product update webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Product deleted webhook
router.post('/products/delete', verifyWebhook, (req, res) => {
  try {
    const product = req.body;
    console.log('Product deleted:', product.title);
    
    // Here you would typically:
    // 1. Remove the product from your database
    // 2. Clean up associated review data
    // 3. Stop monitoring for this product
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Product delete webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// App uninstalled webhook
router.post('/app/uninstalled', verifyWebhook, (req, res) => {
  try {
    const shop = req.body.shop_domain;
    console.log('App uninstalled from shop:', shop);
    
    // Here you would typically:
    // 1. Clean up all data for this shop
    // 2. Remove webhook subscriptions
    // 3. Cancel any scheduled tasks
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('App uninstall webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router; 