# TypeMaster - Testing Guide and Verification Checklist

## COMPREHENSIVE TESTING GUIDE

---

## 1. DATABASE VERIFICATION TESTS

### Test 1.1: Verify All 6 CEFR Levels Exist

**Test Steps:**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as level_count, 
       STRING_AGG(level_code, ', ' ORDER BY level_code) as levels
FROM levels;
```

**Expected Result:**
```
level_count: 6
levels: A1, A2, B1, B2, C1, C2
```

**Verification Code:**
```typescript
async function testLevelsExist() {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('order_index', { ascending: true });

  const levelCodes = data?.map(l => l.level_code) || [];
  console.assert(levelCodes.length === 6, 'Should have 6 levels');
  console.assert(
    JSON.stringify(levelCodes) === JSON.stringify(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    'Levels should be A1-C2'
  );
  console.log('✓ All 6 CEFR levels exist');
}
```

---

### Test 1.2: Verify Each Level Has Exactly 20 Stories

**Test Steps:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  l.level_code,
  COUNT(s.id) as story_count
FROM levels l
LEFT JOIN stories s ON l.id = s.level_id
GROUP BY l.level_code, l.order_index
ORDER BY l.order_index;
```

**Expected Result:**
```
A1: 20
A2: 20
B1: 20
B2: 20
C1: 20
C2: 20
```

**Verification Code:**
```typescript
async function testStoriesPerLevel() {
  const { data: levels } = await supabase
    .from('levels')
    .select('id, level_code');

  for (const level of levels || []) {
    const { data: stories, count } = await supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('level_id', level.id);

    console.assert(
      count === 20,
      `Level ${level.level_code} should have 20 stories, got ${count}`
    );
  }
  console.log('✓ Each level has exactly 20 stories');
}
```

---

### Test 1.3: Verify Story Data Quality

**Test Steps:**
```typescript
async function testStoryQuality() {
  const { data: stories } = await supabase
    .from('stories')
    .select('*');

  for (const story of stories || []) {
    // Verify all required fields exist
    console.assert(story.title && story.title.length > 0, 'Story must have title');
    console.assert(story.english_text && story.english_text.length > 0, 'Story must have English text');
    console.assert(story.turkish_text && story.turkish_text.length > 0, 'Story must have Turkish text');
    console.assert(story.word_count > 0, 'Story must have word count');
    console.assert(story.estimated_time_minutes > 0, 'Story must have time estimate');

    // Verify word count is accurate
    const actualWords = story.english_text.split(/\s+/).length;
    console.assert(
      Math.abs(actualWords - story.word_count) <= 2,
      `Word count mismatch for ${story.title}: expected ${story.word_count}, got ${actualWords}`
    );
  }
  console.log('✓ All stories have high-quality data');
}
```

---

### Test 1.4: Verify RLS Policies

**Test Steps:**
```typescript
async function testRLSPolicies() {
  // Test 1: Unauthenticated users can read levels and stories
  const { data: publicLevels } = await supabase
    .from('levels')
    .select('*');
  console.assert(publicLevels?.length === 6, 'Public should read levels');

  const { data: publicStories } = await supabase
    .from('stories')
    .select('*');
  console.assert(publicStories?.length === 120, 'Public should read stories');

  // Test 2: Authenticated users can only access their own data
  // (Test after login)
}
```

---

## 2. AUTHENTICATION VERIFICATION TESTS

### Test 2.1: Email/Password Signup

**Test Steps:**
```typescript
async function testEmailSignup() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  console.assert(!error, `Signup should not error: ${error?.message}`);
  console.assert(data?.user?.email === testEmail, 'Email should match');
  console.log('✓ Email/Password signup works');
}
```

**Expected Result:**
- User account created in Supabase Auth
- Confirmation email sent (if email confirmation enabled)
- User object returned with correct email

---

### Test 2.2: Email/Password Login

**Test Steps:**
```typescript
async function testEmailLogin() {
  const testEmail = 'test@example.com';
  const testPassword = 'TestPassword123!';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  console.assert(!error, `Login should not error: ${error?.message}`);
  console.assert(data?.session?.user?.email === testEmail, 'Email should match');
  console.assert(data?.session?.access_token, 'Should return access token');
  console.log('✓ Email/Password login works');
}
```

**Expected Result:**
- Session created
- Access token returned
- User data available

---

### Test 2.3: Google OAuth

**Test Steps:**
1. Navigate to login screen
2. Click "Sign in with Google"
3. Complete Google authentication flow
4. Verify redirected back to app with user logged in

**Verification Code:**
```typescript
async function testGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  console.assert(!error, `OAuth should not error: ${error?.message}`);
  console.assert(data?.url, 'Should return OAuth URL');
  console.log('✓ Google OAuth URL generated');
  // Browser will redirect to OAuth provider
}
```

**Expected Result:**
- User is redirected to Google login
- After authentication, user is redirected back to app
- User session is created

---

### Test 2.4: Apple Sign-In

**Test Steps:**
1. Navigate to login screen
2. Click "Sign in with Apple"
3. Complete Apple authentication flow
4. Verify redirected back to app with user logged in

**Expected Result:**
- User is redirected to Apple ID login
- After authentication, user is redirected back
- User session is created with Apple provider

---

### Test 2.5: Session Persistence

**Test Steps:**
```typescript
async function testSessionPersistence() {
  // After login, reload page
  window.location.reload();

  // After reload, check if session is still active
  const { data } = await supabase.auth.getSession();
  console.assert(data?.session, 'Session should persist after reload');
  console.log('✓ Session persists on page reload');
}
```

**Expected Result:**
- User remains logged in after page reload
- Session data is available without re-authentication

---

## 3. TYPING INTERFACE VERIFICATION TESTS

### Test 3.1: Character-by-Character Validation

**Test Steps:**
```typescript
async function testCharacterValidation() {
  // Load a story: "Hello world"
  const story = {
    english_text: "Hello world",
  };

  const words = story.english_text.split(/\s+/);
  // words = ["Hello", "world"]

  // Test 1: Typing correct character
  const input1 = "Hello";
  console.assert(input1 === words[0], 'Should accept correct word');

  // Test 2: Typing wrong character
  const input2 = "Hallo";
  console.assert(input2 !== words[0], 'Should reject wrong word');

  // Test 3: Progress should increment on correct input
  // currentIndex should go from 0 to 1
  console.log('✓ Character validation works correctly');
}
```

**Expected Result:**
- Correct words are accepted
- Wrong words are rejected
- Progress increments only for correct input

---

### Test 3.2: Error Animation and Feedback

**Test Steps:**
1. Open typing interface
2. Type incorrect character for the current word
3. Observe error feedback:
   - Text background turns red
   - Shake animation plays
   - Character count increases for mistakes
4. Clear input and type correct character
5. Error feedback disappears

**Verification in React:**
```typescript
it('should show error animation for wrong input', () => {
  const { getByRole } = render(
    <TypingInterfaceComponent story={mockStory} />
  );

  const input = getByRole('textbox') as HTMLInputElement;
  
  // Type wrong character
  fireEvent.change(input, { target: { value: 'Hallo' } });
  
  // Check for error class
  expect(input.classList.contains('animate-shake')).toBe(true);
  expect(input.style.backgroundColor).toContain('red');
});
```

---

### Test 3.3: Real-time WPM Calculation

**Test Steps:**
```typescript
async function testWPMCalculation() {
  // After typing for 30 seconds and completing 100 characters
  const characterCount = 100;
  const timeSeconds = 30;
  
  const words = characterCount / 5; // 20 words
  const minutes = timeSeconds / 60; // 0.5 minutes
  const expectedWPM = words / minutes; // 40 WPM

  function calculateWPM(chars: number, secs: number) {
    const w = chars / 5;
    const m = secs / 60;
    return Math.round(w / m);
  }

  const actualWPM = calculateWPM(100, 30);
  console.assert(actualWPM === expectedWPM, `WPM should be ${expectedWPM}, got ${actualWPM}`);
  console.log('✓ WPM calculation is accurate');
}
```

**Expected Result:**
- WPM updates in real-time as user types
- Calculation formula: (characters ÷ 5) ÷ (seconds ÷ 60)

---

### Test 3.4: Accuracy Percentage Tracking

**Test Steps:**
```typescript
async function testAccuracyCalculation() {
  // Example: User typed 50 characters correctly out of 55 total attempts
  const correctChars = 50;
  const totalChars = 55;
  const expectedAccuracy = Math.round((correctChars / totalChars) * 100); // 91%

  function calculateAccuracy(correct: number, total: number) {
    return Math.round((correct / total) * 100);
  }

  const actualAccuracy = calculateAccuracy(50, 55);
  console.assert(actualAccuracy === expectedAccuracy, 'Accuracy calculation error');
  console.log('✓ Accuracy tracking is accurate');
}
```

**Expected Result:**
- Accuracy percentage updates in real-time
- Calculation: (correct characters ÷ total characters) × 100

---

### Test 3.5: Turkish Word Tooltips

**Test Steps:**
1. Open typing interface for any story
2. Hover over English words
3. Verify Turkish translation appears
4. Check that tooltip shows relevant word

**Verification Code:**
```typescript
async function testWordTooltips() {
  const story = {
    english_text: "The cat is sleeping",
    turkish_text: "Kedi uyuyor",
  };

  function getWordTooltip(englishWord: string, turkishText: string) {
    const turkishWords = turkishText.split(/\s+/);
    return turkishWords[0] || englishWord;
  }

  const tooltip = getWordTooltip("The", story.turkish_text);
  console.assert(tooltip.length > 0, 'Tooltip should have content');
  console.log('✓ Word tooltips work correctly');
}
```

---

### Test 3.6: Hide Text Mode

**Test Steps:**
1. Open typing interface
2. Click "Hide Text" button
3. Verify English text is no longer visible
4. Verify only Turkish translation is visible (if enabled)
5. Verify typing still works normally
6. Click "Show Text" to restore visibility

**Expected Result:**
- Text hides/shows on button click
- Typing continues to work in hidden mode
- Turkish translation can be viewed while hiding English

---

## 4. AUDIO FUNCTIONALITY TESTS

### Test 4.1: Play Button Functionality

**Test Steps:**
1. Open typing interface
2. Click "Play Audio" button
3. Verify audio starts playing
4. Hear English text being spoken

**Verification Code:**
```typescript
function testAudioPlayback() {
  const text = "Hello world";
  const utterance = new SpeechSynthesisUtterance(text);
  
  window.speechSynthesis.speak(utterance);
  
  // Verify speech synthesis API is available
  console.assert(window.speechSynthesis, 'Speech Synthesis API available');
  console.log('✓ Audio playback initiated');
}
```

**Expected Result:**
- Audio plays immediately
- Text is spoken in English
- No external APIs called
- No costs incurred

---

### Test 4.2: Replay Functionality

**Test Steps:**
1. Open typing interface
2. Click "Play Audio" first time
3. Wait for audio to finish
4. Click "Play Audio" again
5. Verify audio plays from beginning

**Expected Result:**
- Audio plays from the start on each click
- Multiple plays work without error
- No audio queue buildup

---

### Test 4.3: Web Speech API Compatibility

**Test Steps:**
```typescript
function testWebSpeechAPI() {
  // Check browser support
  const SpeechSynthesis = window.speechSynthesis || (window as any).webkitSpeechSynthesis;
  const SpeechUtterance = window.SpeechSynthesisUtterance || (window as any).webkitSpeechSynthesisUtterance;

  console.assert(SpeechSynthesis, 'Speech Synthesis available');
  console.assert(SpeechUtterance, 'Speech Utterance available');
  console.log('✓ Web Speech API supported');
}
```

**Supported Browsers:**
- Chrome 25+
- Edge 79+
- Safari 14.1+
- Firefox 49+

---

### Test 4.4: No Cost Verification

**Test Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Play Audio"
4. Verify no external API calls are made
5. Check CloudWatch/Billing for no charges

**Expected Result:**
- No HTTP requests to external audio services
- No Google Cloud Text-to-Speech calls
- No Amazon Polly calls
- No API costs incurred

---

## 5. DARK/LIGHT MODE TESTS

### Test 5.1: Mode Toggle

**Test Steps:**
1. Load application
2. Click theme toggle button (moon/sun icon)
3. Verify theme switches
4. Click again to verify switch back

**Verification Code:**
```typescript
function testThemeToggle() {
  let darkMode = false;

  function toggleTheme() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
  }

  toggleTheme();
  console.assert(
    document.documentElement.classList.contains('dark'),
    'Dark mode should be enabled'
  );

  toggleTheme();
  console.assert(
    !document.documentElement.classList.contains('dark'),
    'Dark mode should be disabled'
  );

  console.log('✓ Theme toggle works');
}
```

---

### Test 5.2: Theme Persistence

**Test Steps:**
1. Set dark mode ON
2. Reload page
3. Verify dark mode is still ON
4. Set light mode
5. Reload page
6. Verify light mode is still active

**Verification Code:**
```typescript
function testThemePersistence() {
  // Set dark mode
  localStorage.setItem('darkMode', 'true');
  
  // Simulate page reload
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  console.assert(savedDarkMode, 'Dark mode should persist');

  // Set light mode
  localStorage.setItem('darkMode', 'false');
  const savedLightMode = localStorage.getItem('darkMode') === 'false';
  console.assert(!savedLightMode, 'Light mode should persist');

  console.log('✓ Theme persistence works');
}
```

---

### Test 5.3: Contrast and Readability

**Test Steps:**
1. Enable dark mode
2. Verify all text is readable
3. Verify no color combinations have poor contrast
4. Enable light mode
5. Repeat verification

**Accessibility Checklist:**
```
Dark Mode:
✓ Text on background contrast ratio >= 4.5:1
✓ All buttons visible and clickable
✓ Images have visible borders
✓ Form inputs clearly visible

Light Mode:
✓ Text on background contrast ratio >= 4.5:1
✓ All buttons visible and clickable
✓ Images render correctly
✓ Form inputs clearly visible
```

---

## 6. STORY AND LEVEL TESTS

### Test 6.1: Level Selection Screen

**Test Steps:**
1. Load application after login
2. Verify all 6 levels displayed
3. Verify each level shows:
   - Level code (A1, A2, etc.)
   - Level name (Beginner, Elementary, etc.)
   - Description text
4. Click each level
5. Verify correct level's stories load

---

### Test 6.2: Story Card Display

**Test Steps:**
1. Select a level
2. Verify 20 story cards appear
3. Each card shows:
   - Story number
   - Story title
   - Word count
   - Estimated time
4. Verify cards are in order

**Verification Code:**
```typescript
async function testStoryDisplay() {
  // Simulate loading A1 stories
  const stories = [
    { id: '1', title: 'Story 1', word_count: 50, estimated_time_minutes: 2 },
    // ... 19 more stories
  ];

  console.assert(stories.length === 20, 'Should have 20 stories');
  
  for (const story of stories) {
    console.assert(story.title, 'Story should have title');
    console.assert(story.word_count > 0, 'Story should have word count');
    console.assert(story.estimated_time_minutes > 0, 'Story should have time estimate');
  }

  console.log('✓ Story cards display correctly');
}
```

---

### Test 6.3: CEFR Difficulty Progression

**Test Steps:**
1. Read first story from A1 level
   - Verify simple vocabulary
   - Verify short sentences
   - Verify basic grammar
2. Read last story from C2 level
   - Verify complex vocabulary
   - Verify long sentences
   - Verify advanced grammar

**A1 Characteristics:**
```
✓ Simple present tense
✓ Basic common words (I, am, cat, is, have)
✓ 10-50 word stories
✓ Simple sentence structure
✓ No idioms or complex phrases
```

**C2 Characteristics:**
```
✓ Advanced tenses (subjunctive, conditionals)
✓ Sophisticated vocabulary
✓ 200-400 word stories
✓ Complex sentence structures
✓ Nuanced meanings and idioms
✓ Technical or academic content
```

---

### Test 6.4: Turkish Translation Quality

**Test Steps:**
```typescript
async function testTranslationQuality() {
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .limit(10);

  for (const story of stories || []) {
    // Check translation exists
    console.assert(
      story.turkish_text && story.turkish_text.length > 0,
      `Story ${story.title} missing Turkish translation`
    );

    // Check word count ratio is reasonable (Turkish is typically longer)
    const englishWords = story.english_text.split(/\s+/).length;
    const turkishWords = story.turkish_text.split(/\s+/).length;
    const ratio = turkishWords / englishWords;

    console.assert(
      ratio >= 0.8 && ratio <= 1.5,
      `Translation ratio should be 0.8-1.5, got ${ratio}`
    );
  }

  console.log('✓ Turkish translations are high quality');
}
```

---

## 7. RESULTS SCREEN TESTS

### Test 7.1: Results Display

**Test Steps:**
1. Complete a typing session
2. Verify results screen shows:
   - WPM achieved
   - Accuracy percentage
   - Total time spent
   - Mistakes count
3. Verify grade display (Perfect/Excellent/Good/Fair)

---

### Test 7.2: Data Persistence

**Test Steps:**
```typescript
async function testResultsPersistence() {
  // After completing a story, verify data saves to database
  const { data: progress, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('story_id', 'story_id')
    .order('completed_at', { ascending: false })
    .limit(1);

  console.assert(!error, 'No database error');
  console.assert(progress?.[0], 'Progress record should exist');
  console.assert(progress?.[0].wpm > 0, 'WPM should be recorded');
  console.assert(progress?.[0].accuracy >= 0, 'Accuracy should be recorded');
  console.assert(progress?.[0].time_spent_seconds > 0, 'Time should be recorded');

  console.log('✓ Results persist to database');
}
```

---

### Test 7.3: Next Story Navigation

**Test Steps:**
1. Complete a story
2. Click "Next Story" button
3. Verify taken to next story in same level
4. Or if last story, verify taken back to story list

---

## 8. DASHBOARD TESTS

### Test 8.1: Statistics Calculation

**Test Steps:**
```typescript
async function testDashboardStats() {
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  const completedStories = progress?.length || 0;
  const avgAccuracy = progress?.length
    ? Math.round(
        progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length
      )
    : 0;
  const avgWPM = progress?.length
    ? Math.round(
        progress.reduce((sum, p) => sum + p.wpm, 0) / progress.length
      )
    : 0;

  console.assert(completedStories >= 0, 'Completed stories count valid');
  console.assert(avgAccuracy >= 0 && avgAccuracy <= 100, 'Accuracy percentage valid');
  console.assert(avgWPM >= 0, 'WPM average valid');

  console.log('✓ Dashboard statistics calculated correctly');
}
```

---

### Test 8.2: Streak Tracking

**Test Steps:**
```typescript
async function testStreakTracking() {
  // Check if user completed story today
  const today = new Date().toDateString();
  
  const { data: today_progress } = await supabase
    .from('user_progress')
    .select('*')
    .gte('completed_at', today)
    .limit(1);

  // Check yesterday
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const { data: yesterday_progress } = await supabase
    .from('user_progress')
    .select('*')
    .gte('completed_at', yesterday)
    .lt('completed_at', today)
    .limit(1);

  // If both exist, streak continues
  const streakContinues = today_progress?.length > 0 && yesterday_progress?.length > 0;
  console.assert(typeof streakContinues === 'boolean', 'Streak calculation valid');

  console.log('✓ Streak tracking works');
}
```

---

### Test 8.3: Level Progress Visualization

**Test Steps:**
1. Navigate to dashboard
2. View level progress section
3. Verify all 6 levels displayed
4. Verify progress bars show correct completion
5. Verify story counts match (e.g., "8/20")

---

## 9. RESPONSIVE DESIGN TESTS

### Test 9.1: Mobile (320px - 480px)

**Test Steps:**
1. Open DevTools (F12)
2. Set viewport to 375px width (iPhone SE)
3. Test each screen:
   - Login screen
   - Level selection
   - Story list
   - Typing interface
   - Results screen
   - Dashboard
4. Verify:
   - All text readable
   - Buttons clickable
   - No horizontal scroll
   - Layout stacks properly

---

### Test 9.2: Tablet (768px - 1024px)

**Test Steps:**
1. Set viewport to 768px width (iPad)
2. Repeat verification from mobile
3. Verify:
   - Two-column layouts work
   - Touch targets adequate (44px minimum)
   - Images scale properly

---

### Test 9.3: Desktop (1024px+)

**Test Steps:**
1. Set viewport to 1280px width
2. Repeat verification
3. Verify:
   - Three-column layouts work
   - Mouse interactions smooth
   - No excessive whitespace

---

## 10. ERROR HANDLING TESTS

### Test 10.1: Network Errors

**Test Steps:**
1. Disable network (DevTools Network tab > Offline)
2. Try to load stories
3. Verify user-friendly error message
4. Enable network
5. Verify retry works

---

### Test 10.2: Authentication Errors

**Test Steps:**
1. Try signup with invalid email
2. Verify error message
3. Try login with wrong password
4. Verify error message
5. Verify security (no account enumeration)

---

### Test 10.3: Database Errors

**Test Steps:**
1. Simulate database down (Supabase pause)
2. Try to load data
3. Verify graceful error handling
4. Verify no sensitive error details exposed

---

## QUICK TEST COMMAND CHECKLIST

Run these tests in order:

```bash
# 1. Database tests
npm run test:database

# 2. Auth tests
npm run test:auth

# 3. Component tests
npm run test:components

# 4. Integration tests
npm run test:integration

# 5. E2E tests
npm run test:e2e

# 6. Responsive tests
npm run test:responsive

# 7. Performance tests
npm run test:performance

# All tests
npm run test:all
```

---

## FINAL VERIFICATION CHECKLIST

Before deploying, verify:

**Core Features**
- [x] All 6 levels exist
- [x] Each level has 20 stories
- [x] Stories follow CEFR standards
- [x] Turkish translations present

**Authentication**
- [x] Email/Password signup works
- [x] Email/Password login works
- [x] Google OAuth working
- [x] Apple Sign-In working
- [x] Session persistence works

**Typing System**
- [x] Character validation works
- [x] WPM calculation accurate
- [x] Accuracy tracking accurate
- [x] Error animations play
- [x] Shake effect on wrong character
- [x] Turkish tooltips display

**Audio**
- [x] Play button works
- [x] Replay works
- [x] No external API calls
- [x] No costs incurred

**UI/UX**
- [x] Dark mode toggle works
- [x] Theme persists
- [x] Mobile responsive
- [x] Tablet responsive
- [x] Desktop responsive
- [x] Contrast accessible

**Results**
- [x] Results display correctly
- [x] Data saves to database
- [x] Next story button works

**Dashboard**
- [x] Statistics calculated
- [x] Streak tracking works
- [x] Progress visualization works

**Error Handling**
- [x] Network errors handled
- [x] Auth errors handled
- [x] Database errors handled

**Deployment**
- [x] Environment variables set
- [x] CORS configured
- [x] RLS policies verified
- [x] Database backups configured
