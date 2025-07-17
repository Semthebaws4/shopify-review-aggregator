# Shopify Review Aggregator

A Shopify app that aggregates product reviews from multiple sales channels including Shopify and Bol.com.

## Features

- 🔐 Shopify OAuth authentication
- 📊 Product review aggregation from multiple sources
- 🎯 Advanced filtering and search capabilities
- 📱 Responsive design for all devices
- ⚡ Real-time data updates
- 🔄 Webhook support for product changes

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite (development), PostgreSQL (production)
- **APIs**: Shopify Admin API, Bol.com API
- **Hosting**: DigitalOcean App Platform

## Prerequisites

- Node.js 16+ installed
- Shopify Partner account
- DigitalOcean account
- GitHub account

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/shopify-review-app.git
   cd shopify-review-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Shopify app credentials:
   ```env
   SHOPIFY_API_KEY=your_shopify_api_key_here
   SHOPIFY_API_SECRET=your_shopify_api_secret_here
   SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
   SHOPIFY_APP_URL=https://your-app-domain.com
   SHOPIFY_REDIRECT_URI=https://your-app-domain.com/auth/callback
   SESSION_SECRET=your_session_secret_here
   BOL_API_KEY=your_bol_api_key_here
   BOL_API_SECRET=your_bol_api_secret_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Open `http://localhost:3000`
   - Add `?shop=your-shop-name.myshopify.com` to test with a development store

## Shopify App Setup

1. **Create a Shopify Partner account**
   - Go to [partners.shopify.com](https://partners.shopify.com)
   - Sign up for a free account

2. **Create a new app**
   - In your Partner Dashboard, click "Apps" → "Create app"
   - Choose "Custom app" or "Public app"
   - Fill in app details

3. **Configure app settings**
   - **App URL**: Your production domain (e.g., `https://your-app.ondigitalocean.app`)
   - **Allowed redirection URLs**: `https://your-app.ondigitalocean.app/auth/callback`
   - **Admin API access scopes**: `read_products`, `write_products`, `read_orders`, `write_orders`

4. **Get your API credentials**
   - Copy the API key and API secret key
   - Add them to your environment variables

## Deployment to DigitalOcean App Platform

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Update the app.yaml file**
   - Replace `your-username` with your actual GitHub username
   - Update the repository name if different

### Step 2: Create DigitalOcean App

1. **Log into DigitalOcean**
   - Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - Navigate to "Apps" in the left sidebar

2. **Create a new app**
   - Click "Create App"
   - Choose "GitHub" as the source
   - Connect your GitHub account if not already connected
   - Select your `shopify-review-app` repository
   - Choose the `main` branch

3. **Configure the app**
   - **Name**: `shopify-review-aggregator`
   - **Environment**: Node.js
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3000`

4. **Set environment variables**
   In the "Environment Variables" section, add:
   ```
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_API_SECRET=your_shopify_api_secret
   SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders
   SHOPIFY_APP_URL=https://your-app.ondigitalocean.app
   SHOPIFY_REDIRECT_URI=https://your-app.ondigitalocean.app/auth/callback
   SESSION_SECRET=your_random_session_secret
   BOL_API_KEY=your_bol_api_key
   BOL_API_SECRET=your_bol_api_secret
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy the app**
   - Click "Create Resources"
   - Wait for the deployment to complete
   - Note your app URL (e.g., `https://shopify-review-aggregator-abc123.ondigitalocean.app`)

### Step 3: Update Shopify App Settings

1. **Update your Shopify app configuration**
   - Go back to your Shopify Partner Dashboard
   - Update the App URL with your DigitalOcean app URL
   - Update the Allowed redirection URLs
   - Save the changes

2. **Test the deployment**
   - Visit your app URL
   - Try installing the app on a development store

## API Integration

### Shopify Reviews

The app currently uses mock data for Shopify reviews. To integrate with real Shopify reviews:

1. **Install Shopify Product Reviews app** on your store
2. **Update the `getShopifyReviews` function** in `routes/api.js` to fetch real reviews
3. **Use Shopify's GraphQL API** to query product reviews

### Bol.com Reviews

To integrate with real Bol.com reviews:

1. **Register for Bol.com API access**
2. **Update the `getBolReviews` function** in `routes/api.js`
3. **Add proper error handling** for API rate limits

## Webhooks

The app includes webhook handlers for:
- Product creation
- Product updates
- Product deletion
- App uninstallation

To enable webhooks:

1. **Configure webhook URLs** in your Shopify app settings
2. **Update webhook verification** in `routes/webhooks.js`
3. **Test webhook delivery** using Shopify's webhook testing tools

## Customization

### Adding New Review Sources

1. **Create a new function** in `routes/api.js` (e.g., `getAmazonReviews`)
2. **Update the `getProductReviews` function** to include the new source
3. **Update the frontend** to display the new source
4. **Add source filtering** in the UI

### Styling

- **CSS**: Edit `public/css/styles.css`
- **Layout**: Modify `public/index.html`
- **Functionality**: Update `public/js/app.js`

## Troubleshooting

### Common Issues

1. **App not loading**
   - Check environment variables
   - Verify Shopify API credentials
   - Check DigitalOcean app logs

2. **Authentication errors**
   - Ensure redirect URLs match exactly
   - Check session configuration
   - Verify HTTPS is enabled

3. **API errors**
   - Check API rate limits
   - Verify API credentials
   - Review error logs

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=shopify:*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Amazon reviews integration
- [ ] Review analytics dashboard
- [ ] Automated review monitoring
- [ ] Email notifications
- [ ] Review response management
- [ ] Multi-language support 