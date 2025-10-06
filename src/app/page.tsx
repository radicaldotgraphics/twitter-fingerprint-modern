'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
import ClientOnly from '@/components/ClientOnly';
import { useTwitterData } from '@/hooks/useTwitterData';
import { processTwitterData } from '@/lib/analytics';
import TwitterCompass from '@/components/TwitterCompass/TwitterCompass';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function TwitterFingerprintApp() {
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const { data: twitterData, isLoading, error: queryError } = useTwitterData(username);

  const handleUserSubmit = (user: string) => {
    setUsername(user);
    setError('');
  };

  const getErrorMessage = () => {
    if (error) return error;
    if (queryError) return queryError.message;
    return '';
  };

  // Process the data when it's available
  const analyticsData = twitterData ? processTwitterData(twitterData.tweets) : null;

  return (
    <div className="min-h-screen bg-[#27363f]">
      <div className="chart-wrap">
        <div className="chart">
          <h1>Hello.</h1>
          
          {!analyticsData && (
            <div className="input-wrap">
              <input 
                className="user-name" 
                type="text" 
                placeholder="twitter @username"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      handleUserSubmit(value.replace('@', ''));
                    }
                  }
                }}
              />
              <div 
                className="user-submit"
                onClick={() => {
                  const input = document.querySelector('.user-name') as HTMLInputElement;
                  const value = input?.value.trim();
                  if (value) {
                    handleUserSubmit(value.replace('@', ''));
                  }
                }}
              >
                RUN
              </div>
              {getErrorMessage() && (
                <p className="error-mssg">{getErrorMessage()}</p>
              )}
            </div>
          )}

          {isLoading && username && (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}

          {analyticsData && (
            <ClientOnly>
              <TwitterCompass 
                data={analyticsData} 
                username={username!}
                onReset={() => {
                  setUsername(null);
                  setError('');
                }}
              />
            </ClientOnly>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <TwitterFingerprintApp />
    </QueryClientProvider>
  );
}