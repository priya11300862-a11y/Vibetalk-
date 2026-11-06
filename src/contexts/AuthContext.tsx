import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SubscriptionTier } from '../types';
import { INITIAL_CURRENT_USER, INITIAL_DISCOVER_PROFILES } from '../services/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { signOutFirebase } from '../lib/firebase';

export interface RegisterData {
  firstName: string;
  username: string;
  email?: string;
  phoneNumber: string;
  password?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'female' | 'male' | 'non-binary' | 'other';
  country: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  isAdultConfirmed: boolean;
}

export interface MiniMothSession {
  access_token?: string;
  refresh_token?: string | null;
  expires_at?: string;
  identity_id?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAgeVerified: boolean;
  miniMothSession: MiniMothSession | null;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithFirebasePhone: (phoneNumber: string, firebaseUid?: string) => Promise<{ success: boolean; user?: UserProfile }>;
  // MiniMoth Phone OTP Methods
  sendMiniMothOtp: (phone: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    otp_id?: string;
    channel?: string;
    isSandbox?: boolean;
    sandboxCode?: string;
    retryAfterSeconds?: number;
  }>;
  verifyMiniMothOtp: (
    phone: string,
    code: string
  ) => Promise<{
    success: boolean;
    isNewUser?: boolean;
    user?: UserProfile;
    tokens?: MiniMothSession;
    error?: string;
  }>;
  completeOnboarding: (data: RegisterData) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchProfile: (profileId: string) => void;
  updateCurrentUserProfile: (partial: Partial<UserProfile>) => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to compute age from YYYY-MM-DD
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vibetalk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [miniMothSession, setMiniMothSession] = useState<MiniMothSession | null>(() => {
    const savedSession = localStorage.getItem('vibetalk_minimoth_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vibetalk_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vibetalk_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (miniMothSession) {
      localStorage.setItem('vibetalk_minimoth_session', JSON.stringify(miniMothSession));
    } else {
      localStorage.removeItem('vibetalk_minimoth_session');
    }
  }, [miniMothSession]);

  // Send OTP via Backend MiniMoth Integration
  const sendMiniMothOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Failed to dispatch verification code via MiniMoth.',
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }

      return {
        success: true,
        message: data.message || 'OTP sent successfully. Please check your phone.',
        otp_id: data.otp_id,
        channel: data.channel,
        isSandbox: data.isSandbox,
        sandboxCode: data.sandboxCode,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error: Unable to reach the VibeTalk server.',
      };
    }
  };

  // Verify OTP via Backend MiniMoth Integration
  const verifyMiniMothOtp = async (phone: string, code: string) => {
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Verification failed. Please check the code.',
        };
      }

      if (data.tokens) {
        setMiniMothSession(data.tokens);
      }

      if (data.isNewUser) {
        return {
          success: true,
          isNewUser: true,
          tokens: data.tokens,
        };
      }

      // Existing returning user
      if (data.user) {
        setCurrentUser(data.user);
      }

      return {
        success: true,
        isNewUser: false,
        user: data.user,
        tokens: data.tokens,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error: Failed to verify code.',
      };
    }
  };

  // Complete Profile Onboarding for New User after OTP Verification
  const completeOnboarding = async (data: RegisterData) => {
    const computedAge = calculateAge(data.dateOfBirth);
    if (computedAge < 18) {
      return {
        success: false,
        error: `Age Restriction: You must be at least 18 years old to join VibeTalk (calculated age: ${computedAge}). Minors are strictly prohibited.`,
      };
    }
    if (!data.isAdultConfirmed) {
      return {
        success: false,
        error: 'Mandatory confirmation required: You must confirm that you are 18 years or older.',
      };
    }

    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: data.phoneNumber,
          identity_id: miniMothSession?.identity_id,
          firstName: data.firstName,
          username: data.username,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          country: data.country,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          interests: data.interests,
          languages: data.languages,
          isAdultConfirmed: data.isAdultConfirmed,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok || !resData.success) {
        return {
          success: false,
          error: resData.error || 'Failed to complete profile creation.',
        };
      }

      setCurrentUser(resData.user);
      return {
        success: true,
        user: resData.user,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error during profile onboarding.',
      };
    }
  };

  const login = async (emailOrUser: string, _pass: string) => {
    // If Supabase is connected:
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrUser,
        password: _pass,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (prof) {
          setCurrentUser(prof);
          return { success: true };
        }
      }
    }

    if (!emailOrUser) {
      return { success: false, error: 'Please enter your username or email' };
    }
    setCurrentUser(INITIAL_CURRENT_USER);
    return { success: true };
  };

  const register = async (data: RegisterData) => {
    return completeOnboarding(data);
  };

  const verifyOtp = async (code: string) => {
    if (code.length === 6) {
      return { success: true };
    }
    return { success: false, error: 'Invalid 6-digit OTP code. Please try again.' };
  };

  const loginWithFirebasePhone = async (
    phoneNumber: string,
    firebaseUid?: string
  ): Promise<{ success: boolean; user?: UserProfile }> => {
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    const userProfile: UserProfile = {
      id: firebaseUid ? `fb_${firebaseUid}` : `usr_phone_${formattedPhone.slice(-6)}`,
      username: `user_${formattedPhone.slice(-4)}`,
      firstName: 'VibeTalk Member',
      displayName: `VibeTalk User (${phoneNumber.slice(-4)})`,
      phoneNumber: phoneNumber,
      dateOfBirth: '2000-01-01',
      age: 26,
      isAdultConfirmed: true,
      gender: 'other',
      country: 'Global',
      broadLocation: 'Verified Phone Member',
      bio: 'Verified VibeTalk member connected via mobile OTP authentication.',
      avatarUrl: INITIAL_CURRENT_USER.avatarUrl,
      languages: ['English', 'Hindi'],
      interests: ['#Chatting', '#Music', '#Networking'],
      isVerified: true,
      verificationStatus: 'verified',
      moderationStatus: 'clean',
      isOnline: true,
      availabilityStatus: 'online',
      activeTopic: 'Usual',
      lastSeen: 'Just now',
      role: 'user',
      subscriptionTier: 'free',
      coins: 80,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`vibetalk_phone_profile_${phoneNumber}`, JSON.stringify(userProfile));
    setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  };

  const logout = () => {
    signOutFirebase();
    setCurrentUser(null);
    setMiniMothSession(null);
    localStorage.removeItem('vibetalk_user');
    localStorage.removeItem('vibetalk_minimoth_session');
    // Notify server of logout
    fetch('/api/session/logout', { method: 'POST' }).catch(() => {});
  };

  const switchProfile = (profileId: string) => {
    if (profileId === 'usr_me_001') {
      setCurrentUser(INITIAL_CURRENT_USER);
    } else {
      const found = INITIAL_DISCOVER_PROFILES.find((p) => p.id === profileId);
      if (found) {
        setCurrentUser({ ...found });
      }
    }
  };

  const updateCurrentUserProfile = (partial: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, ...partial } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAgeVerified: !!currentUser?.isAdultConfirmed && (currentUser?.age ?? 0) >= 18,
        miniMothSession,
        login,
        loginWithFirebasePhone,
        sendMiniMothOtp,
        verifyMiniMothOtp,
        completeOnboarding,
        register,
        verifyOtp,
        logout,
        switchProfile,
        updateCurrentUserProfile,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
