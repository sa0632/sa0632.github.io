exports.handler = async function(event) {
  const { code } = event.queryStringParameters;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return { statusCode: 400, body: 'Failed to get token' };
    }

    // Send tokens back to the frontend via URL params
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || ''
    });

    return {
      statusCode: 302,
      headers: { Location: `/?${params.toString()}` }
    };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};