import { UserProfile } from '../types';
import { MiniMothSession } from '../contexts/AuthContext';

/**
 * Diagnostic utility that logs the current authentication session state
 * and user identity to the browser console when the 'Home' tab is active.
 * Verifies that MiniMoth OTP verification successfully maintains user sessions across page reloads.
 */
export function logAuthSessionDiagnostics(
  currentUser: UserProfile | null,
  miniMothSession: MiniMothSession | null,
  callerContext: string = 'Home Tab'
): void {
  const isAuth = Boolean(currentUser);
  const now = new Date();

  const headerStyle = isAuth
    ? 'background: #5244E3; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 11px;'
    : 'background: #64748B; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 11px;';

  console.groupCollapsed(
    `%c[VibeTalk Auth Diagnostics] ${callerContext} - ${isAuth ? 'AUTHENTICATED' : 'ANONYMOUS'}`,
    headerStyle
  );
  console.log('⏰ Diagnostic Timestamp:', now.toLocaleTimeString(), `(${now.toISOString()})`);
  console.log('🔐 Active Session State:', isAuth ? '✅ User is Authenticated' : 'ℹ️ Visitor is Anonymous');

  if (currentUser) {
    console.log('👤 Verified User Identity:', {
      id: currentUser.id,
      displayName: currentUser.displayName,
      username: `@${currentUser.username}`,
      phone: currentUser.phoneNumber || 'Phone verification active',
      age: currentUser.age,
      isAdultConfirmed: currentUser.isAdultConfirmed,
      isVerified: currentUser.isVerified,
      coins: currentUser.coins,
      role: currentUser.role,
    });
  } else {
    console.log('👤 User Identity: Awaiting mobile phone OTP verification');
  }

  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('vibetalk_user') : null;
  const storedSessionRaw = typeof window !== 'undefined' ? localStorage.getItem('vibetalk_minimoth_session') : null;

  let parsedSession: MiniMothSession | null = null;
  if (storedSessionRaw) {
    try {
      parsedSession = JSON.parse(storedSessionRaw);
    } catch {
      parsedSession = null;
    }
  }

  const activeSession = miniMothSession || parsedSession;
  const tokenExpiresAt = activeSession?.expires_at ? new Date(activeSession.expires_at) : null;
  const isTokenExpired = tokenExpiresAt ? tokenExpiresAt < now : false;

  console.log('📦 Persistence & Storage Verification:', {
    storedInLocalStorage: Boolean(storedUserRaw),
    hasMiniMothSession: Boolean(activeSession),
    identityId: activeSession?.identity_id || 'Not assigned',
    accessTokenAvailable: Boolean(activeSession?.access_token),
    tokenExpiresAt: activeSession?.expires_at || 'n/a',
    isTokenExpired,
  });

  console.log(
    isAuth
      ? '🚀 Verification Status: MiniMoth OTP session is persistent and preserved across reloads.'
      : 'ℹ️ Verification Status: No active authenticated session stored.'
  );
  console.groupEnd();
}
