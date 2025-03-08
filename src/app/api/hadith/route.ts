import { NextResponse } from 'next/server';
import axios from 'axios';

type HadithResponse = {
  text: string;
  chain: Array<{ name: string }>;
  source: string;
};

export async function GET(request: Request) {
  try {
    // Fetch hadith from the external API
    const response = await axios.get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-abudawud/sections/6.json');
    
    // Get a random hadith from the collection
    const hadiths = response.data.hadiths;
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    const randomHadith = hadiths[randomIndex];
    
    const hadithResponse: HadithResponse = {
      text: randomHadith.text,
      chain: [{ name: randomHadith.narrator || 'Abu Dawud' }],
      source: 'Sunan Abu Dawud, Section 14 (Fasting)'
    };

    return NextResponse.json(hadithResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Hadith' },
      { status: 500 }
    );
  }
}