import { TwitterData } from '@/types';

export async function fetchTwitterData(username: string): Promise<TwitterData> {
  try {
    const response = await fetch(`/api/twitter/timeline?screen_name=${username}`);
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid username provided');
      } else if (response.status === 404) {
        throw new Error('User not found');
      } else if (response.status >= 500) {
        throw new Error('Server error occurred');
      } else {
        throw new Error(`Failed to fetch data for @${username} (${response.status})`);
      }
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}
