import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const screenName = searchParams.get('screen_name');

  console.log('API Request:', { screenName, url: request.url });

  if (!screenName) {
    console.log('API Error: No screen name provided');
    return NextResponse.json(
      { error: 'Screen name is required' },
      { status: 400 }
    );
  }

  try {
    // For now, return mock data to demonstrate the functionality
    // In a real implementation, you would integrate with Twitter API
    const mockTweets = generateMockTweets(screenName);
    
    const response = NextResponse.json({
      tweets: mockTweets,
      user: {
        screen_name: screenName,
        name: screenName.charAt(0).toUpperCase() + screenName.slice(1),
        profile_image_url: `https://via.placeholder.com/200x200/ec4899/ffffff?text=${screenName.charAt(0).toUpperCase()}`
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

function generateMockTweets(screenName: string) {
  const tweets = [];
  const now = new Date();
  
  // Generate 50 mock tweets with realistic patterns
  for (let i = 0; i < 50; i++) {
    const tweetDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Spread over 50 days
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    tweetDate.setHours(hour, minute, 0, 0);
    
    const tweetLengths = [20, 45, 67, 89, 120, 140, 95, 78, 156, 134];
    const randomLength = tweetLengths[Math.floor(Math.random() * tweetLengths.length)];
    
    const tweetText = generateMockTweetText(randomLength);
    
    tweets.push({
      id: `tweet_${i}`,
      text: tweetText,
      created_at: tweetDate.toISOString(),
      user: {
        screen_name: screenName,
        name: screenName.charAt(0).toUpperCase() + screenName.slice(1)
      }
    });
  }
  
  return tweets;
}

function generateMockTweetText(length: number) {
  const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ];
  
  const hashtags = ['#coding', '#javascript', '#react', '#webdev', '#tech', '#programming', '#ai', '#startup'];
  const mentions = ['@twitter', '@github', '@stackoverflow', '@dev', '@coder'];
  
  let text = '';
  let currentLength = 0;
  
  while (currentLength < length - 10) {
    const word = words[Math.floor(Math.random() * words.length)];
    if (currentLength + word.length + 1 <= length) {
      text += (text ? ' ' : '') + word;
      currentLength = text.length;
    } else {
      break;
    }
  }
  
  // Sometimes add hashtags or mentions
  if (Math.random() < 0.3 && currentLength < length - 5) {
    const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
    if (currentLength + hashtag.length + 1 <= length) {
      text += ' ' + hashtag;
    }
  }
  
  if (Math.random() < 0.2 && currentLength < length - 5) {
    const mention = mentions[Math.floor(Math.random() * mentions.length)];
    if (currentLength + mention.length + 1 <= length) {
      text += ' ' + mention;
    }
  }
  
  return text;
}
