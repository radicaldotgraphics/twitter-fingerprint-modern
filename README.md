# Twitter Fingerprint 🐦

A modern React application that analyzes Twitter activity patterns and creates beautiful visualizations of user behavior.

## ✨ Features

- **Time of Day Analysis** - See when users are most active
- **Tweet Length Distribution** - Analyze character count patterns  
- **Character Frequency** - Discover most used characters
- **Interactive Charts** - Beautiful, responsive visualizations
- **Real-time Data** - Live Twitter API integration
- **Mobile Responsive** - Works on all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts, D3.js
- **State Management**: Zustand, TanStack Query
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Twitter API credentials

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd twitter-fingerprint
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Twitter API credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📊 API Configuration

### Twitter API Setup

1. Create a Twitter Developer account
2. Create a new app and get your credentials
3. Add credentials to `.env.local`:

```env
TWITTER_CONSUMER_KEY=your_consumer_key
TWITTER_CONSUMER_SECRET=your_consumer_secret  
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎨 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── TwitterFingerprint/ # Main app components
│   └── UI/                # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker

```bash
# Build image
docker build -t twitter-fingerprint .

# Run container
docker run -p 3000:3000 twitter-fingerprint
```

## 🔒 Security

- API keys stored in environment variables
- Rate limiting implemented
- Input validation and sanitization
- CORS configuration
- Error handling without data exposure

## 📈 Performance

- Server-side rendering with Next.js
- Image optimization
- Code splitting and lazy loading
- Redis caching for API responses
- Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using modern React patterns**