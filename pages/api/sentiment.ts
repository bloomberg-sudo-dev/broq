import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Use OpenAI for sentiment analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis assistant. Analyze the sentiment of the given text and respond with exactly one word: "positive", "negative", or "neutral". Do not include any other text or explanation.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return res.status(500).json({ error: 'Failed to analyze sentiment' });
    }

    const data = await response.json();
    const sentiment = data.choices?.[0]?.message?.content?.trim().toLowerCase();

    // Validate the response
    const validSentiments = ['positive', 'negative', 'neutral'];
    if (!validSentiments.includes(sentiment)) {
      console.warn('Invalid sentiment response:', sentiment);
      return res.status(500).json({ error: 'Invalid sentiment analysis result' });
    }

    return res.status(200).json({ 
      sentiment,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : '') // Return truncated text for reference
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 