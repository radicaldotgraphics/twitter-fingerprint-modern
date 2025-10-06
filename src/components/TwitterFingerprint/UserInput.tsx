'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Twitter } from 'lucide-react';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

interface UserInputProps {
  onSubmit: (username: string) => void;
  loading?: boolean;
  error?: string;
}

export default function UserInput({ onSubmit, loading = false, error }: UserInputProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim().replace('@', ''));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4"
        >
          <Twitter className="w-8 h-8 text-pink-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Twitter Fingerprint
        </h1>
        <p className="text-gray-600">
          Discover your unique Twitter activity patterns
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter Twitter username (without @)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={error}
          helperText="Enter a Twitter username to analyze their activity patterns"
          className="text-center"
        />
        
        <Button
          type="submit"
          loading={loading}
          disabled={!username.trim() || loading}
          className="w-full"
          size="lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Analyze Profile
        </Button>
      </form>
    </motion.div>
  );
}
