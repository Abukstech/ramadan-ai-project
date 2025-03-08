import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type ReflectionRequest = {
  hadith: string;
};

type ReflectionResponse = {
  analysis: string;
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { hadith } = (await request.json()) as ReflectionRequest;
    
    const prompt = `As an Islamic scholar, provide a concise analysis of the following hadith in exactly three bullet points:

"${hadith}"

Please format your response as follows:
• Main Lesson: [The core teaching or moral of the hadith]
• Practical Application: [How to apply this teaching in modern life]
• Spiritual Significance: [The deeper spiritual meaning]

Keep each bullet point brief and focused.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a knowledgeable Islamic scholar who provides thoughtful, respectful analysis of Islamic teachings."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    const analysis = completion.choices[0]?.message?.content || 'Could not generate reflection';

    return NextResponse.json({ analysis }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Reflection generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}