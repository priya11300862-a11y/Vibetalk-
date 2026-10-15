import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, SubscriptionTier } from '../types';
import { INITIAL_CURRENT_USER, INITIAL_DISCOVER_PROFILES } from '../services/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { signOutFirebase } from '../lib/firebase';

interface RegisterData {
  firstName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'female' | 'male' | 'non-binary' | 'other';
  country: string;
  avatarUrl?: string;
  isAdultConfirmed: boolean;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAgeVerified: boolean;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithFirebasePhone: (phoneNumber: string, firebaseUid?: string) => Promise<{ success: boolean; user?: UserProfile }>;
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
        return INITIAL_CURRENT_USER;
      }
    }
    return INITIAL_CURRENT_USER;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vibetalk_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vibetalk_user');
    }
  }, [currentUser]);

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
        // Fetch profile
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

    // Default high-fidelity local session
    if (!emailOrUser) {
      return { success: false, error: 'Please enter your username or email' };
    }
    // Set authenticated user
    setCurrentUser(INITIAL_CURRENT_USER);
    return { success: true };
  };

  const register = async (data: RegisterData) => {
    // Strict 18+ enforcement validation
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

    if (!data.username || !data.email || !data.firstName) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: data.username.toLowerCase().trim(),
      firstName: data.firstName,
      displayName: `${data.firstName}`,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      age: computedAge,
      isAdultConfirmed: true,
      gender: data.gender,
      country: data.country,
      broadLocation: `${data.country}`,
      bio: 'New member discovering VibeTalk.',
      avatarUrl: data.avatarUrl || INITIAL_CURRENT_USER.avatarUrl,
      languages: ['English'],
      interests: ['Networking', 'Music', 'Travel'],
      isVerified: false,
      verificationStatus: 'unverified',
      moderationStatus: 'clean',
      isOnline: true,
      lastSeen: 'Just now',
      role: 'user',
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    return { success: true };
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
    // 1. If Supabase is connected, query or upsert profile
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone_number', phoneNumber)
          .single();

        if (existingProf) {
          setCurrentUser(existingProf);
          return { success: true, user: existingProf };
        }
      } catch (e) {
        console.warn('Supabase profile query fallback:', e);
      }
    }

    // 2. Local profile lookup / persistence
    const savedUserJson = localStorage.getItem(`vibetalk_phone_profile_${phoneNumber}`);
    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson);
        setCurrentUser(parsed);
        return { success: true, user: parsed };
      } catch {
        // Fallback
      }
    }

    // 3. Create fresh verified phone profile for VibeTalk
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
      bio: 'Verified VibeTalk member connected via Firebase Phone Authentication.',
      avatarUrl: INITIAL_CURRENT_USER.avatarUrl,
      languages: ['English'],
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
        login,
        loginWithFirebasePhone,
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
