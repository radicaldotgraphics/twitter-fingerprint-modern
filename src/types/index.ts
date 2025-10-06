export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: {
    screen_name: string;
    name: string;
  };
}

export interface TwitterData {
  tweets: Tweet[];
  user: {
    screen_name: string;
    name: string;
    profile_image_url: string;
  };
}

export interface AnalyticsData {
  timeOfDay: Record<string, number>;
  tweetLength: Record<string, number>;
  characterFrequency: Record<string, number>;
  stats: {
    totalTweets: number;
    averageTweetLength: number;
    mostActiveTime: string;
    leastActiveTime: string;
    mostUsedCharacter: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
