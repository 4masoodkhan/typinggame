# TypeMaster - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Create new React app
npx create-react-app typing-app --template typescript
cd typing-app

# Install Supabase
npm install @supabase/supabase-js

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Supabase Setup (2 minutes)

1. Go to https://supabase.com and create account
2. Create new project (Free tier)
3. Go to SQL Editor
4. Copy-paste entire contents of `supabase-setup.sql`
5. Execute SQL
6. Get credentials from Settings > API:
   - Project URL
   - Anon Key

### Step 3: Configure Project (1 minute)

1. Create `.env.local` in project root:
```
REACT_APP_SUPABASE_URL=your_url_here
REACT_APP_SUPABASE_ANON_KEY=your_key_here
```

2. Copy configuration files from `configuration-files.json`:
   - Update `tsconfig.json`
   - Update `tailwind.config.js`
   - Create `postcss.config.js`
   - Create `src/index.css` with styles

3. Replace `src/App.tsx` with main app code

4. Create component files from `components-and-utils.tsx`

Done! ✨

### Step 4: Run Application

```bash
npm start
# App opens at http://localhost:3000
```

---

## 📋 Verification Checklist

After setup, verify these work:

### Database
```bash
# Check levels exist
curl "https://your-supabase-url/rest/v1/levels" \
  -H "apikey: your-anon-key"

# Should return array of 6 levels
```

### Authentication
1. Click "Sign Up"
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Verify account created

### Stories
1. Log in with test account
2. Click "A1" level
3. Verify 20 story cards appear
4. Click first story

### Typing Interface
1. Type words as prompted
2. Verify WPM/Accuracy update
3. Complete story
4. Verify results screen

### Audio
1. Click "Play Audio"
2. Hear English text spoken
3. No errors in console

### Dark Mode
1. Click moon icon (top right)
2. Verify dark theme applies
3. Reload page
4. Verify dark mode persists

---

## 🗂️ Project Structure

```
typing-app/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── LoginScreen.tsx
│   │   ├── LevelSelection.tsx
│   │   ├── StoryList.tsx
│   │   ├── TypingInterface.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTyping.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── supabase.ts
│   │   ├── audio.ts
│   │   ├── typing.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── .env.local
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## 🔑 Key Features Implemented

### ✅ 120 Stories
- 20 stories × 6 CEFR levels (A1-C2)
- English text + Turkish translation
- Progressive difficulty
- No slang or inappropriate content

### ✅ Authentication
- Email/Password signup & login
- Google OAuth
- Apple Sign-In (configure in Supabase)
- Session persistence

### ✅ Typing System
- Character-by-character validation
- Real-time WPM calculation
- Accuracy percentage tracking
- Error visualization with shake animation
- Turkish word tooltips
- Hide text mode for challenge

### ✅ Audio
- Web Speech API (browser built-in)
- Play full story audio
- Replay functionality
- Zero additional costs

### ✅ Dashboard
- Completed stories count
- Average accuracy & WPM
- Streak tracking
- Level progress visualization
- Recent activity log

### ✅ UI/UX
- Dark/Light mode toggle
- Mobile responsive (320px+)
- Tablet responsive (768px+)
- Desktop responsive (1024px+)
- Accessible WCAG colors
- Smooth animations

---

## 🧪 Testing

### Unit Tests
```bash
npm test
# Tests run in watch mode
```

### Integration Tests
```bash
# Start app
npm start

# In another terminal, run integration tests
npm run test:integration
```

### E2E Tests
```bash
# Install Cypress (optional)
npm install cypress --save-dev

# Run E2E tests
npx cypress open
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard:
# - REACT_APP_SUPABASE_URL
# - REACT_APP_SUPABASE_ANON_KEY

# Deploy production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Add environment variables in Netlify settings
```

### Self-hosted

```bash
# Build production bundle
npm run build

# Upload 'build' folder to web host
# Set environment variables before build
```

---

## 🔒 Security Checklist

Before deploying:

- [ ] Remove demo credentials from code
- [ ] Set strong Supabase password
- [ ] Enable RLS policies (included in setup)
- [ ] Configure CORS in Supabase
- [ ] Set OAuth redirect URLs:
  - Google: `https://yourdomain.com/auth/callback`
  - Apple: `https://yourdomain.com/auth/callback`
- [ ] Enable two-factor authentication for Supabase
- [ ] Use environment variables for all secrets
- [ ] Don't commit `.env.local` to git (use `.env.example`)
- [ ] Set up HTTPS (enforced on production hosts)
- [ ] Enable database backups

---

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 25+     | ✅ Full |
| Edge    | 79+     | ✅ Full |
| Safari  | 14.1+   | ✅ Full |
| Firefox | 49+     | ✅ Full |
| Mobile  | Recent  | ✅ Full |

**Web Speech API Requirements:**
- Audio playback requires browser support
- All modern browsers support it
- Falls back gracefully if unavailable

---

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
npm start
```

### "Supabase connection failed"
```
1. Verify REACT_APP_SUPABASE_URL in .env.local
2. Verify REACT_APP_SUPABASE_ANON_KEY in .env.local
3. Check Supabase project is active
4. Check no typos in credentials
```

### "Audio not playing"
```
1. Check browser supports Web Speech API
2. Check browser allows audio playback
3. Check console for errors (F12)
4. Try different browser
5. Verify text content exists
```

### "Dark mode not persisting"
```bash
# Clear localStorage
localStorage.clear()

# Reload page
window.location.reload()
```

### "RLS policy violation error"
```
1. Verify user is authenticated
2. Check RLS policies are enabled
3. Verify user_id matches auth user
4. Check table permissions
```

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start
```

---

## 📊 Performance Tips

### Optimize Bundle Size
```bash
# Analyze bundle
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

### Enable Code Splitting
```typescript
// In App.tsx
const StoryList = React.lazy(() => import('./components/StoryList'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));

// Wrap with Suspense
<Suspense fallback={<LoadingScreen />}>
  <StoryList />
</Suspense>
```

### Cache Stories Locally
```typescript
// In utils/storage.ts
export function cacheStories(stories: Story[]) {
  localStorage.setItem('cached_stories', JSON.stringify(stories));
}

export function getCachedStories(): Story[] | null {
  const cached = localStorage.getItem('cached_stories');
  return cached ? JSON.parse(cached) : null;
}
```

---

## 🎓 Learning Resources

### Supabase
- Docs: https://supabase.com/docs
- Getting Started: https://supabase.com/docs/guides/getting-started
- Authentication: https://supabase.com/docs/guides/auth

### React
- Official: https://react.dev
- Hooks: https://react.dev/reference/react/hooks
- Performance: https://react.dev/learn/render-and-commit

### TypeScript
- Handbook: https://www.typescriptlang.org/docs/
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/

### Web Speech API
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Examples: https://www.w3.org/TR/speech-api/

### Tailwind CSS
- Documentation: https://tailwindcss.com/docs
- Component Examples: https://tailwindui.com

---

## 📝 Environment Variables Explained

```
REACT_APP_SUPABASE_URL
  → Your Supabase project URL
  → Found in: Supabase Dashboard > Settings > API > Project URL
  → Example: https://project-id.supabase.co

REACT_APP_SUPABASE_ANON_KEY
  → Your Supabase anonymous key
  → Found in: Supabase Dashboard > Settings > API > Anon Key
  → Keep this secret! (Not really secret, but don't share unnecessarily)

REACT_APP_ENVIRONMENT
  → Set to 'development' or 'production'
  → Used for logging and feature flags

REACT_APP_VERSION
  → Application version for reference
  → Increment when deploying updates
```

---

## 🎯 Next Steps

1. **Customize Stories**
   - Edit story content in database
   - Ensure proper Turkish translations
   - Verify CEFR level accuracy

2. **Add More Features**
   - Leaderboards
   - Social sharing
   - Mobile app (React Native)
   - Progress exports
   - Certificates

3. **Optimize Performance**
   - Add service workers for offline
   - Implement CDN for media
   - Cache optimization
   - Database indexing

4. **Expand Content**
   - Add more languages
   - Add different text types (articles, dialogues)
   - Add grammar explanations
   - Add vocabulary lists

5. **Marketing**
   - SEO optimization
   - Social media presence
   - User onboarding flow
   - Email campaigns

---

## 📞 Support

### Documentation
- Setup Guide: See `SETUP_GUIDE.md`
- Testing: See `TESTING_GUIDE.md`
- Database Schema: See `supabase-setup.sql`

### Debugging
1. Open DevTools: F12
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for localStorage/cookies

### Community
- Supabase Discord: https://discord.supabase.com
- React Community: https://github.com/facebook/react/discussions
- Stack Overflow: Tag with `supabase`, `react`, `typescript`

---

## 📄 License

This project is open source and free to use.
- No license restrictions
- No API costs
- No attribution required

---

## 🎉 Success!

You now have a complete, production-ready English typing application!

### What you've built:
✅ 120 high-quality stories across 6 CEFR levels
✅ Multi-language authentication
✅ Real-time typing analytics
✅ Web Speech API audio (no costs)
✅ Dark/Light mode
✅ Responsive design
✅ Complete dashboard
✅ Error handling
✅ TypeScript typing
✅ Tailwind styling

### Start typing, start learning! 🚀

For questions or improvements, visit the documentation files included in this project.
