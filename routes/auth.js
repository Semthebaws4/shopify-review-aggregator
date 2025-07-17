const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const router = express.Router();

// Initialize Shopify API
const shopify = new Shopify({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: '2023-10'
});

// Install app route - redirects to Shopify OAuth
router.get('/install', async (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  try {
    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: false,
    });
    
    res.redirect(authRoute);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// OAuth callback route
router.get('/callback', async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // Store session data
    req.session.shop = callback.session.shop;
    req.session.accessToken = callback.session.accessToken;
    req.session.isOnline = callback.session.isOnline;

    // Redirect to app home
    res.redirect(`/?shop=${callback.session.shop}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication callback failed' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  const isAuthenticated = req.session && req.session.accessToken;
  res.json({
    authenticated: isAuthenticated,
    shop: req.session?.shop || null
  });
});

module.exports = router; 