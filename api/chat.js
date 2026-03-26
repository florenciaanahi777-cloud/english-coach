export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check that the API key has been set in Vercel's environment variables
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set' });
  }

  const { messages, system } = req.body;

  // Prepend system message if provided (Groq uses OpenAI format)
  const fullMessages = system
    ? [{ role: 'system', content: system }, ...(messages || [])]
    : (messages || []);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: fullMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Groq API error', details: errorData });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
