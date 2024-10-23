// index.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect endpoint to initiate Facebook login
app.get('/connect', (req, res) => {
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&scope=public_profile,email,pages_read_user_content,pages_read_engagement,pages_manage_posts,pages_show_list`;
  res.redirect(authUrl);
});

// Callback endpoint to handle the redirect from Facebook
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    const redirectUri = process.env.REDIRECT_URI;

    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        },
      });

      const userAccessToken = tokenResponse.data.access_token;

      // Log the User Access Token for publishing
      console.log(`User Access Token: ${userAccessToken}`);

      res.send('Access token retrieved! You can now publish to your feed.');
    } catch (error) {
      console.error('Error retrieving access token:', error.response.data);
      res.status(500).send('Error retrieving access token.');
    }
  });

// Step 3: Publish to Facebook
app.post('/publish', async (req, res) => {
  const message = req.body.message; // The message to post
  const userAccessToken = req.body.accessToken; // Use the User Access Token you obtained

  try {
    const publishResponse = await axios.post(`https://graph.facebook.com/v12.0/me/feed`, {
      message: message,
      access_token: userAccessToken,
    });

    console.log('Post published successfully:', publishResponse.data);
    res.send('Post published successfully!');
  } catch (error) {
    console.error('Error publishing post:', error.response.data);
    res.status(500).send('Error publishing post: '+JSON.stringify(error.response.data));
  }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  
