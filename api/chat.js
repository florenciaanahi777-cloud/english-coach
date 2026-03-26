export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check that the API key has been set in Vercel's environment variables
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
  }

  // Pull the messages and system prompt out of the request body
  const { messages, system } = req.body;

  try {
    // Call the Anthropic API from the server side (key stays secret)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: system || '',
        messages: messages || [],
      }),
    });

    // If Anthropic returned an error, surface it clearly
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: 'Anthropic API error',
        details: errorData,
      });
    }

    // Parse the response and return just the text content
    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    return res.status(200).json({ text });

  } catch (err) {
    // Catch network errors or unexpected failures
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
