🧩 Step 1. Create a Twitter (X) Developer Account

Go to https://developer.x.com

Log in with your Twitter/X account (the one you want to use as developer/admin).

Click “Apply” for a Developer Account.

When prompted for use case, choose:

Building tools for social media management,

or Posting and scheduling tweets on behalf of users.

Once approved, you’ll have access to the Twitter Developer Portal.

🛠️ Step 2. Create a New Project and App

Go to the Developer Portal Dashboard
.

Click “+ Create Project” → name it (e.g., “GetLate Social Automation”).

Then create an App inside that project.

You’ll get an API Key, API Secret Key, and Bearer Token.

Store these safely — you’ll use them for authentication.

🔐 Step 3. Set up OAuth 2.0 (for user-based posting)

If you want users to log in and let your app post on their behalf (like Buffer or GetLate.dev):

In your app settings, go to “User authentication settings”.

Enable OAuth 2.0.

Set:

Type: Read and Write (or Read, Write, and Direct Messages if needed)

Callback URL: your app’s frontend route for redirect after login (e.g., https://yourapp.com/auth/callback/twitter)

Website URL: your main domain

Permissions: select Read and Write

After saving, note your:

Client ID

Client Secret

You’ll use these for the OAuth 2.0 authorization code flow.

🔄 Step 4. Implement the OAuth Flow

This lets your users connect their Twitter accounts.

You’ll:

Redirect the user to Twitter’s OAuth URL with your Client ID and redirect URI.

They log in and authorize your app.

Twitter redirects back to your callback with an authorization code.

You exchange that code for an access token using your Client Secret.

You save that access token for that user (to post on their behalf).

Here’s a high-level example (Node/Express backend):

// Step 1: Redirect user to Twitter
app.get('/auth/twitter', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: 'https://yourapp.com/auth/callback/twitter',
    scope: 'tweet.read tweet.write users.read offline.access',
    state: 'randomstring123',
    code_challenge: 'challenge',
    code_challenge_method: 'plain'
  });
  res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
});

// Step 2: Handle callback
app.get('/auth/callback/twitter', async (req, res) => {
  const { code } = req.query;
  const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', {
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: 'https://yourapp.com/auth/callback/twitter',
    code_verifier: 'challenge'
  }, {
    auth: {
      username: process.env.TWITTER_CLIENT_ID,
      password: process.env.TWITTER_CLIENT_SECRET
    }
  });

  const accessToken = tokenResponse.data.access_token;
  // Save token to DB for this user
  res.send('Connected successfully!');
});

📝 Step 5. Post Tweets Programmatically

Once you have the user’s access token, you can make a POST request to:

POST https://api.x.com/2/tweets
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "text": "Hello world! Posted via my AI social app 🚀"
}


You can automate scheduling, queues, analytics, etc. using this endpoint.

🧰 Step 6. Use SDKs (Optional)

You can use libraries to simplify the integration:

Node.js: twitter-api-v2

Python: tweepy

These handle OAuth, posting, and more easily.

Example with twitter-api-v2:

import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi('USER_ACCESS_TOKEN');
await client.v2.tweet('Posting with Twitter API v2 🚀');

🚀 Step 7. Move to Production

Apply for Elevated Access if you need more tweet volume.

Add your privacy policy and terms of service URLs.

Ensure you comply with Twitter’s Automation Rules.