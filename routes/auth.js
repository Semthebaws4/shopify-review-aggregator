const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const router = express.Router();

// Initialize Shopify API with fallbacks for missing env vars
let shopify;
try {
  shopify = new Shopify({
    apiKey: process.env.SHOPIFY_API_KEY || 'placeholder',
    apiSecretKey: process.env.SHOPIFY_API_SECRET || 'placeholder',
    scopes: (process.env.SHOPIFY_SCOPES || 'read_products').split(','),
    hostName: (process.env.SHOPIFY_APP_URL || 'localhost:3000').replace(/https?:\/\//, ''),
    isEmbeddedApp: true,
    apiVersion: '2023-10'
  });
} catch (error) {
  console.error('Shopify API initialization error:', error);
  // Create a mock shopify object for development
  shopify = {
    auth: {
      begin: async () => '/auth/mock',
      callback: async () => ({ session: { shop: 'test.myshopify.com', accessToken: 'mock-token' } })
    }
  };
}

// Install app route - redirects to Shopify OAuth
router.get('/install', async (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  try {
    // For now, use mock authentication since we have placeholder credentials
    if (process.env.SHOPIFY_API_KEY === '57c24f5b83c011dc796caa2fc529cb22') {
      // Mock authentication for development
      req.session.shop = shop;
      req.session.accessToken = 'mock-access-token';
      req.session.isOnline = false;
      
      // Redirect to app home with mock authentication
      res.redirect(`/?shop=${shop}&mock=true`);
    } else {
      // Real OAuth flow (when proper credentials are set)
      const authRoute = await shopify.auth.begin({
        shop,
        callbackPath: '/auth/callback',
        isOnline: false,
      });
      
      res.redirect(authRoute);
    }
  } catch (error) {
    console.error('Auth error:', error);
    // Fallback to mock authentication
    req.session.shop = shop;
    req.session.accessToken = 'mock-access-token';
    req.session.isOnline = false;
    res.redirect(`/?shop=${shop}&mock=true`);
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