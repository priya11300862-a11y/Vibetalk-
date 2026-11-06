import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { normalizeAndValidatePhone } from './src/utils/phoneUtils';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security & Parsing Middlewares
app.use(express.json());

// In-Memory Rate Limiter for Phone OTP
interface RateLimitRecord {
  lastSentAt: number;
  attemptsInWindow: number;
  verifyFailures: number;
  lockoutUntil: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of rateLimitStore.entries()) {
    if (now - record.lastSentAt > 15 * 60 * 1000 && record.lockoutUntil < now) {
      rateLimitStore.delete(phone);
    }
  }
}, 5 * 60 * 1000);

// Persistence for users database
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser {
  id: string;
  phone: string;
  identity_id?: string;
  firstName: string;
  displayName: string;
  username: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  country: string;
  broadLocation: string;
  bio: string;
  avatarUrl: string;
  languages: string[];
  interests: string[];
  isVerified: boolean;
  verificationStatus: string;
  moderationStatus: string;
  isAdultConfirmed: boolean;
  isOnline: boolean;
  role: string;
  subscriptionTier: string;
  coins: number;
  createdAt: string;
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users store:', err);
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users store:', err);
  }
}

// MiniMoth API Base URL
const MINIMOTH_BASE_URL = 'https://api.minimoth.dev';

// Health & Config Check (Does not expose secret keys)
app.get('/api/health', (_req: Request, res: Response) => {
  const apiKey = process.env.MINIMOTH_API_KEY?.trim() || '';
  const isConfigured = Boolean(apiKey);
  const isTestKey = apiKey.startsWith('mm_test_');

  res.json({
    status: 'ok',
    minimoth: {
      configured: isConfigured,
      mode: !isConfigured ? 'unconfigured' : isTestKey ? 'sandbox' : 'production',
      prefix: isConfigured ? apiKey.slice(0, 8) + '...' : null,
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. SEND OTP ENDPOINT (/api/otp/send)
// ==========================================
app.post('/api/otp/send', async (req: Request, res: Response): Promise<void> => {
  const { phone, countryCode = '+91' } = req.body;

  if (!phone || typeof phone !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Mobile phone number is required.',
    });
    return;
  }

  // Strictly normalize & validate phone number (e.g. TRAI 10-digit, no duplicate +91)
  const validation = normalizeAndValidatePhone(phone, countryCode);
  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: validation.error || 'Invalid mobile phone number format.',
      code: 'INVALID_PHONE_FORMAT',
    });
    return;
  }

  const normalizedPhone = validation.phone; // Guaranteed clean +91XXXXXXXXXX or E.164

  // Check Rate Limits
  const now = Date.now();
  let record = rateLimitStore.get(normalizedPhone);
  if (!record) {
    record = {
      lastSentAt: 0,
      attemptsInWindow: 0,
      verifyFailures: 0,
      lockoutUntil: 0,
    };
    rateLimitStore.set(normalizedPhone, record);
  }

  // Check if locked out
  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    res.status(429).json({
      success: false,
      error: `Too many attempts. For security, please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      retryAfterSeconds: remainingSeconds,
    });
    return;
  }

  // Prevent spamming requests within 25 seconds
  if (now - record.lastSentAt < 25 * 1000) {
    const waitSeconds = Math.ceil((25 * 1000 - (now - record.lastSentAt)) / 1000);
    res.status(429).json({
      success: false,
      error: `Please wait ${waitSeconds} seconds before requesting another verification code.`,
      retryAfterSeconds: waitSeconds,
    });
    return;
  }

  // Check hourly window limit (max 6 requests per 10 minutes)
  if (now - record.lastSentAt > 10 * 60 * 1000) {
    record.attemptsInWindow = 0;
  }
  if (record.attemptsInWindow >= 6) {
    record.lockoutUntil = now + 10 * 60 * 1000;
    res.status(429).json({
      success: false,
      error: 'Hourly OTP limit reached for this number. Please try again in 10 minutes.',
      retryAfterSeconds: 600,
    });
    return;
  }

  // Retrieve Server API Key
  const apiKey = process.env.MINIMOTH_API_KEY?.trim();
  if (!apiKey) {
    res.status(400).json({
      success: false,
      error: 'MiniMoth API key is not configured on the server. Please set MINIMOTH_API_KEY in your .env file.',
      requiresConfig: true,
    });
    return;
  }

  try {
    // Call MiniMoth official endpoint: POST /v1/otp/send
    const minimothResponse = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ phone: normalizedPhone }),
    });

    const responseData = await minimothResponse.json().catch(() => ({}));

    if (!minimothResponse.ok) {
      const status = minimothResponse.status;
      let errorMsg = responseData?.error || responseData?.message || 'Failed to dispatch OTP code via MiniMoth.';

      if (status === 401) {
        errorMsg = responseData?.error || 'MiniMoth Authentication Error: Invalid or expired MINIMOTH_API_KEY. Check your project API key at app.minimoth.dev.';
      } else if (status === 429) {
        errorMsg = responseData?.error || responseData?.message || 'MiniMoth Rate limit exceeded. Please wait a moment before trying again.';
      } else if (status === 422 || status === 400) {
        errorMsg = responseData?.error || responseData?.message || 'Invalid phone number format for MiniMoth delivery.';
      }

      res.status(status).json({
        success: false,
        error: errorMsg,
        code: responseData?.code,
        requestId: responseData?.request_id,
      });
      return;
    }

    // Success: Update rate limit record
    record.lastSentAt = now;
    record.attemptsInWindow += 1;
    rateLimitStore.set(normalizedPhone, record);

    const isSandbox = apiKey.startsWith('mm_test_');

    res.json({
      success: true,
      message: responseData.message || 'OTP sent successfully. Please check your phone.',
      otp_id: responseData.otp_id || responseData.request_id || `otp_${Date.now()}`,
      phone: normalizedPhone,
      expires_at: responseData.expires_at,
      channel: responseData.channel || 'whatsapp/sms',
      isSandbox,
      sandboxCode: isSandbox ? '000000' : undefined,
    });
  } catch (err: any) {
    console.error('MiniMoth Network Error while sending OTP:', err.message);
    res.status(503).json({
      success: false,
      error: 'Unable to reach MiniMoth verification servers. Please check your network connection and try again.',
    });
  }
});

// ==========================================
// 2. VERIFY OTP ENDPOINT (/api/otp/verify)
// ==========================================
app.post('/api/otp/verify', async (req: Request, res: Response): Promise<void> => {
  const { phone, code, countryCode = '+91' } = req.body;

  if (!phone || typeof phone !== 'string') {
    res.status(400).json({ success: false, error: 'Phone number is required.' });
    return;
  }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: '6-digit OTP code is required.' });
    return;
  }

  const validation = normalizeAndValidatePhone(phone, countryCode);
  if (!validation.isValid) {
    res.status(400).json({
      success: false,
      error: validation.error || 'Invalid phone number format.',
      code: 'INVALID_PHONE_FORMAT',
    });
    return;
  }
  const normalizedPhone = validation.phone;
  const cleanCode = code.trim().replace(/\D/g, '');

  if (cleanCode.length !== 6) {
    res.status(400).json({
      success: false,
      error: 'Please enter a valid 6-digit verification code.',
    });
    return;
  }

  // Rate Limiter / Failure tracking
  const now = Date.now();
  let record = rateLimitStore.get(normalizedPhone);
  if (!record) {
    record = {
      lastSentAt: 0,
      attemptsInWindow: 0,
      verifyFailures: 0,
      lockoutUntil: 0,
    };
    rateLimitStore.set(normalizedPhone, record);
  }

  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    res.status(429).json({
      success: false,
      error: `Too many failed attempts. Please wait ${remainingSeconds} seconds before trying again.`,
    });
    return;
  }

  // Retrieve Server API Key
  const apiKey = process.env.MINIMOTH_API_KEY?.trim();
  if (!apiKey) {
    res.status(400).json({
      success: false,
      error: 'MiniMoth API key is not configured on the server. Please set MINIMOTH_API_KEY in your .env file.',
      requiresConfig: true,
    });
    return;
  }

  try {
    // Call MiniMoth official endpoint: POST /v1/otp/verify
    const minimothResponse = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        code: cleanCode,
      }),
    });

    const responseData = await minimothResponse.json().catch(() => ({}));

    if (!minimothResponse.ok) {
      record.verifyFailures += 1;
      if (record.verifyFailures >= 5) {
        record.lockoutUntil = now + 5 * 60 * 1000; // 5 minute cooldown
      }
      rateLimitStore.set(normalizedPhone, record);

      const status = minimothResponse.status;
      let errorMsg =
        responseData?.error ||
        responseData?.message ||
        'The verification code you entered is invalid or has expired.';

      if (status === 401) {
        errorMsg =
          responseData?.error ||
          'MiniMoth Authentication Error: Invalid or expired MINIMOTH_API_KEY. Check your project API key at app.minimoth.dev.';
      }

      res.status(status).json({
        success: false,
        error: errorMsg,
        code: responseData?.code,
        requestId: responseData?.request_id,
        remainingAttempts: Math.max(0, 5 - record.verifyFailures),
      });
      return;
    }

    // Success: reset failures
    record.verifyFailures = 0;
    rateLimitStore.set(normalizedPhone, record);

    // Extract official tokens returned by MiniMoth
    const accessToken = responseData.access_token || `mm_tok_${Date.now()}`;
    const refreshToken = responseData.refresh_token || null;
    const expiresAt = responseData.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const identityId = responseData.identity_id || `id_${normalizedPhone.replace(/\D/g, '').slice(-8)}`;

    // Query existing profile store
    const users = loadUsers();
    const existingUser = users.find((u) => u.phone === normalizedPhone);

    if (existingUser) {
      // Returning user found: update last active
      existingUser.isOnline = true;
      existingUser.identity_id = identityId;
      existingUser.updatedAt = new Date().toISOString();
      saveUsers(users);

      res.json({
        success: true,
        message: 'Phone verified successfully. Welcome back to VibeTalk!',
        isNewUser: false,
        user: existingUser,
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          identity_id: identityId,
        },
      });
      return;
    }

    // New User: Return verified token and flag to show profile creation / onboarding screen
    res.json({
      success: true,
      message: 'Phone verified successfully! Please complete your VibeTalk profile.',
      isNewUser: true,
      phone: normalizedPhone,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        identity_id: identityId,
      },
    });
  } catch (err: any) {
    console.error('MiniMoth Network Error while verifying OTP:', err.message);
    res.status(503).json({
      success: false,
      error: 'Unable to reach MiniMoth verification servers. Please check your connection and try again.',
    });
  }
});

// ==========================================
// 2.5. OTP DELIVERY STATUS CHECK (/api/otp/status/:otp_id)
// ==========================================
app.get('/api/otp/status/:otp_id', async (req: Request, res: Response): Promise<void> => {
  const { otp_id } = req.params;
  if (!otp_id) {
    res.status(400).json({ success: false, error: 'OTP request ID is required.' });
    return;
  }

  const apiKey = process.env.MINIMOTH_API_KEY?.trim();
  if (!apiKey) {
    res.status(400).json({
      success: false,
      error: 'MiniMoth API key is not configured on the server.',
      requiresConfig: true,
    });
    return;
  }

  try {
    const minimothRes = await fetch(`${MINIMOTH_BASE_URL}/v1/otp/status/${encodeURIComponent(otp_id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await minimothRes.json().catch(() => ({}));

    if (!minimothRes.ok) {
      res.status(minimothRes.status).json({
        success: false,
        error: data?.error || data?.message || 'Failed to check OTP delivery status.',
        code: data?.code,
        requestId: data?.request_id,
      });
      return;
    }

    res.json({
      success: true,
      otp_id: data.otp_id || otp_id,
      status: data.status, // "delivered", "sent", "pending", "failed"
      channel: data.channel, // "whatsapp" | "sms"
      delivered_at: data.delivered_at,
      phone: data.phone,
      isDelivered: data.status === 'delivered',
    });
  } catch (err: any) {
    console.error('MiniMoth Network Error while checking OTP status:', err.message);
    res.status(503).json({
      success: false,
      error: 'Unable to reach MiniMoth verification servers to check delivery status.',
    });
  }
});

// ==========================================
// 3. COMPLETE ONBOARDING PROFILE (/api/profile/complete)
// ==========================================
app.post('/api/profile/complete', (req: Request, res: Response): void => {
  const {
    phone,
    identity_id,
    firstName,
    username,
    dateOfBirth,
    gender,
    country,
    bio,
    avatarUrl,
    interests,
    languages,
    isAdultConfirmed,
  } = req.body;

  if (!phone || typeof phone !== 'string') {
    res.status(400).json({ success: false, error: 'Verified phone number is required.' });
    return;
  }
  if (!firstName || !username || !dateOfBirth) {
    res.status(400).json({ success: false, error: 'First name, username, and date of birth are required.' });
    return;
  }
  if (!isAdultConfirmed) {
    res.status(400).json({ success: false, error: 'You must confirm that you are 18 years or older.' });
    return;
  }

  // Calculate age
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }

  if (calculatedAge < 18) {
    res.status(403).json({
      success: false,
      error: `Age Restriction: You must be at least 18 years old to join VibeTalk (calculated age: ${calculatedAge}). Minors are strictly prohibited.`,
    });
    return;
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const users = loadUsers();

  // Check if profile already exists for this phone
  let user = users.find((u) => u.phone === normalizedPhone);
  if (!user) {
    const formattedPhoneDigits = normalizedPhone.replace(/\D/g, '');
    user = {
      id: `usr_${formattedPhoneDigits.slice(-8)}_${Date.now().toString(36)}`,
      phone: normalizedPhone,
      identity_id: identity_id || undefined,
      firstName: firstName.trim(),
      displayName: firstName.trim(),
      username: username.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''),
      dateOfBirth,
      age: calculatedAge,
      gender: gender || 'other',
      country: country || 'India',
      broadLocation: country || 'India',
      bio: bio?.trim() || 'New member on VibeTalk.',
      avatarUrl: avatarUrl || '/src/assets/images/profile_avatar_clara_1791455885616.jpg',
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English', 'Hindi'],
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['#Chatting', '#Music', '#Dating'],
      isVerified: true,
      verificationStatus: 'verified',
      moderationStatus: 'clean',
      isAdultConfirmed: true,
      isOnline: true,
      role: 'user',
      subscriptionTier: 'free',
      coins: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
  } else {
    user.firstName = firstName.trim();
    user.displayName = firstName.trim();
    user.username = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    user.dateOfBirth = dateOfBirth;
    user.age = calculatedAge;
    user.gender = gender || user.gender;
    user.country = country || user.country;
    user.bio = bio?.trim() || user.bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (interests) user.interests = interests;
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();
  }

  saveUsers(users);

  res.json({
    success: true,
    message: 'Profile created successfully! Welcome to VibeTalk.',
    user,
  });
});

// ==========================================
// 4. RETRIEVE PROFILE BY PHONE (/api/profile/lookup)
// ==========================================
app.get('/api/profile/lookup', (req: Request, res: Response): void => {
  const phone = req.query.phone as string;
  if (!phone) {
    res.status(400).json({ success: false, error: 'Phone parameter is required.' });
    return;
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const users = loadUsers();
  const found = users.find((u) => u.phone === normalizedPhone);

  if (found) {
    res.json({ success: true, exists: true, user: found });
  } else {
    res.json({ success: true, exists: false });
  }
});

// ==========================================
// 5. DEV & PROD SERVING SETUP
// ==========================================
async function startServer() {
  if (!isProduction) {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VibeTalk Server] Server running on http://0.0.0.0:${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer().catch((err) => {
  console.error('[VibeTalk Server] Failed to start server:', err);
  process.exit(1);
});
