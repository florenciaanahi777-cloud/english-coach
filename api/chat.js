export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check that the API key has been set in Vercel's environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
  }

  const { messages, system } = req.body;

  // Convert from standard message format to Gemini's format
  // Gemini uses "model" instead of "assistant" for AI messages
  const contents = (messages || []).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Gemini API error', details: errorData });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
