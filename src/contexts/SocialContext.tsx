import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserPreferences,
  Conversation,
  Message,
  NotificationItem,
  ReportItem,
  VerificationRequest,
  AuditLogItem,
  SubscriptionTier,
} from '../types';
import {
  INITIAL_DISCOVER_PROFILES,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_VERIFICATIONS,
  INITIAL_AUDIT_LOGS,
  PORTRAIT_STORY_CYAN,
} from '../services/mockData';
import { useAuth } from './AuthContext';

interface DiscoverFilters {
  searchQuery: string;
  minAge: number;
  maxAge: number;
  country: string;
  language: string;
  onlineOnly: boolean;
  verifiedOnly: boolean;
}

interface SocialContextType {
  profiles: UserProfile[];
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  verificationRequests: VerificationRequest[];
  auditLogs: AuditLogItem[];
  blockedUserIds: string[];
  connectedUserIds: string[];
  pendingRequestIds: string[];
  preferences: UserPreferences;
  filters: DiscoverFilters;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  setFilters: React.Dispatch<React.SetStateAction<DiscoverFilters>>;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'audio' | 'file', mediaUrl?: string, replyToId?: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string, forEveryone?: boolean) => void;
  sendConnectionRequest: (targetUserId: string) => void;
  acceptConnectionRequest: (senderUserId: string) => void;
  removeConnection: (targetUserId: string) => void;
  blockUser: (targetUserId: string, reason?: string) => void;
  unblockUser: (targetUserId: string) => void;
  submitReport: (reportedUserId: string, category: ReportItem['category'], details: string, messageId?: string) => void;
  submitVerificationRequest: (docType: 'government_id' | 'passport' | 'driving_license') => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  // Admin actions
  adminVerifyUser: (userId: string) => void;
  adminSuspendUser: (userId: string) => void;
  adminBanUser: (userId: string) => void;
  adminResolveReport: (reportId: string, resolution: 'resolved' | 'dismissed') => void;
  // Subscription
  upgradeSubscription: (tier: SubscriptionTier) => void;
  // Data Export
  downloadMyData: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  userId: 'usr_me_001',
  showOnlineStatus: true,
  showLastSeen: true,
  showBroadLocation: true,
  allowDiscovery: true,
  allowFriendRequests: true,
  whoCanMessage: 'all',
  whoCanCall: 'connections',
  whoCanVideoCall: 'connections',
  readReceipts: true,
  typingIndicator: true,
  pushNotifications: true,
  callNotifications: true,
  profileVisibility: 'public',
  photoVisibility: 'everyone',
  bioVisibility: 'everyone',
  interestsVisibility: 'everyone',
  languagesVisibility: 'everyone',
  locationVisibility: 'approximate',
  activityVisibility: 'everyone',
};

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('vibetalk_profiles');
    return saved ? JSON.parse(saved) : INITIAL_DISCOVER_PROFILES;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('vibetalk_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('vibetalk_messages');
    if (saved) return JSON.parse(saved);
    // Initial sample messages matching conversation list items
    return {
      conv_kristin: [
        {
          id: 'msg_kris_1',
          conversationId: 'conv_kristin',
          senderId: 'usr_kristin_watson',
          content: "Hi 😊 It's great to connect! Yours",
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '9:38 AM',
        },
        {
          id: 'msg_kris_2',
          conversationId: 'conv_kristin',
          senderId: 'usr_kristin_watson',
          content: 'It seems we have a lot in common and share so many artistic vibes 😍',
          messageType: 'text',
          reactions: { '❤️': ['usr_me_001'] },
          status: 'read',
          createdAt: '9:39 AM',
        },
        {
          id: 'msg_kris_3',
          conversationId: 'conv_kristin',
          senderId: 'usr_kristin_watson',
          content: 'Neon Bloom Concept ✨',
          messageType: 'image',
          mediaUrl: PORTRAIT_STORY_CYAN,
          reactions: { '🔥': ['usr_me_001'] },
          status: 'read',
          createdAt: '9:40 AM',
        },
        {
          id: 'msg_kris_4',
          conversationId: 'conv_kristin',
          senderId: 'usr_kristin_watson',
          content: 'Voice note (0:24)',
          messageType: 'audio',
          audioDuration: 24,
          reactions: {},
          status: 'read',
          createdAt: '9:40 AM',
        },
        {
          id: 'msg_kris_5',
          conversationId: 'conv_kristin',
          senderId: 'usr_me_001',
          content: 'Good Concepts! Absolutely in love with this aesthetic 💎',
          messageType: 'text',
          reactions: { '❤️': ['usr_kristin_watson'] },
          status: 'read',
          createdAt: '9:41 AM',
        },
      ],
      conv_daniel: [
        {
          id: 'msg_dan_1',
          conversationId: 'conv_daniel',
          senderId: 'usr_daniel_garcia',
          content: "Hi 😊 It's god. Yours",
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '9:38 AM',
        },
        {
          id: 'msg_dan_2',
          conversationId: 'conv_daniel',
          senderId: 'usr_daniel_garcia',
          content: 'It seem we have a lot common and have a lot interest in each other 😍',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '9:39 AM',
        },
        {
          id: 'msg_dan_3',
          conversationId: 'conv_daniel',
          senderId: 'usr_daniel_garcia',
          content: 'Visual concept draft',
          messageType: 'image',
          mediaUrl: '/src/assets/images/story_ethereal_cyan_1791906607608.jpg',
          reactions: { '❤️': ['usr_me_001'] },
          status: 'read',
          createdAt: '9:40 AM',
        },
        {
          id: 'msg_dan_4',
          conversationId: 'conv_daniel',
          senderId: 'usr_daniel_garcia',
          content: 'Voice message',
          messageType: 'audio',
          audioDuration: 165,
          reactions: {},
          status: 'read',
          createdAt: '9:40 AM',
        },
        {
          id: 'msg_dan_5',
          conversationId: 'conv_daniel',
          senderId: 'usr_me_001',
          content: 'Good Concepts!',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '9:41 AM',
        },
      ],
      conv_resilient: [
        {
          id: 'msg_res_0',
          conversationId: 'conv_resilient',
          senderId: 'usr_me_001',
          content: 'Are you joining the Tamil poetry session tonight?',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: 'Yesterday, 8:12 PM',
        },
        {
          id: 'msg_res_1',
          conversationId: 'conv_resilient',
          senderId: 'usr_ruhi_201',
          content: 'may be',
          messageType: 'text',
          reactions: { '❤️': ['usr_me_001'] },
          status: 'read',
          createdAt: 'Yesterday, 8:14 PM',
        },
      ],
      conv_thaaraa: [
        {
          id: 'msg_tha_1',
          conversationId: 'conv_thaaraa',
          senderId: 'usr_ananya_202',
          content: 'hi',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '06/10/26, 4:20 PM',
        },
      ],
      conv_jamuna: [
        {
          id: 'msg_jam_0',
          conversationId: 'conv_jamuna',
          senderId: 'usr_me_001',
          content: 'Which city are you from?',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '06/10/26, 11:02 AM',
        },
        {
          id: 'msg_jam_1',
          conversationId: 'conv_jamuna',
          senderId: 'usr_rakhi_102',
          content: 'Cuddalore',
          messageType: 'text',
          reactions: { '🔥': ['usr_me_001'] },
          status: 'read',
          createdAt: '06/10/26, 11:05 AM',
        },
      ],
      conv_iniya: [
        {
          id: 'msg_ini_0',
          conversationId: 'conv_iniya',
          senderId: 'usr_milkee_203',
          content: 'Did you finish listening to that podcast?',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '06/10/26, 9:15 AM',
        },
        {
          id: 'msg_ini_1',
          conversationId: 'conv_iniya',
          senderId: 'usr_me_001',
          content: 'You: hm',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '06/10/26, 9:18 AM',
        },
      ],
      conv_sara: [
        {
          id: 'msg_sar_0',
          conversationId: 'conv_sara',
          senderId: 'usr_vichu_103',
          content: 'Sleep early today, we have calls tomorrow!',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '06/10/26, 11:42 PM',
        },
        {
          id: 'msg_sar_1',
          conversationId: 'conv_sara',
          senderId: 'usr_me_001',
          content: 'You: good night',
          messageType: 'text',
          reactions: { '❤️': ['usr_vichu_103'] },
          status: 'read',
          createdAt: '06/10/26, 11:45 PM',
        },
      ],
      conv_bubloo: [
        {
          id: 'msg_bub_0',
          conversationId: 'conv_bubloo',
          senderId: 'usr_me_001',
          content: 'Wait are you leaving the voice room already?',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '05/10/26, 7:10 PM',
        },
        {
          id: 'msg_bub_1',
          conversationId: 'conv_bubloo',
          senderId: 'usr_marcus_003',
          content: 'leave byeeee',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: '05/10/26, 7:12 PM',
        },
      ],
      conv_clara: [
        {
          id: 'msg_c_1',
          conversationId: 'conv_clara',
          senderId: 'usr_clara_002',
          content: 'Hey Alex! Loved your new sound design reel. The analog textures are incredible.',
          messageType: 'text',
          reactions: { '❤️': ['usr_me_001'] },
          status: 'read',
          createdAt: '2:10 PM',
        },
        {
          id: 'msg_c_2',
          conversationId: 'conv_clara',
          senderId: 'usr_me_001',
          content: 'Thank you Clara! It was recorded with an old reel-to-reel deck from Berlin.',
          messageType: 'text',
          reactions: { '🔥': ['usr_clara_002'] },
          status: 'read',
          createdAt: '2:12 PM',
        },
        {
          id: 'msg_c_3',
          conversationId: 'conv_clara',
          senderId: 'usr_clara_002',
          content: 'I loved that track you sent earlier. Are you free for a quick voice call later tonight?',
          messageType: 'text',
          reactions: { '❤️': ['usr_me_001'] },
          status: 'read',
          createdAt: '2:15 PM',
        },
      ],
      conv_marcus: [
        {
          id: 'msg_m_1',
          conversationId: 'conv_marcus',
          senderId: 'usr_marcus_003',
          content: 'Hey! Did you check out the brutalist gallery in London we talked about?',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: 'Yesterday',
        },
        {
          id: 'msg_m_2',
          conversationId: 'conv_marcus',
          senderId: 'usr_me_001',
          content: 'Sent you the portfolio layout! Let me know what you think.',
          messageType: 'text',
          reactions: { '🔥': ['usr_marcus_003'] },
          status: 'read',
          createdAt: '45 min ago',
        },
      ],
      conv_elena: [
        {
          id: 'msg_e_1',
          conversationId: 'conv_elena',
          senderId: 'usr_elena_004',
          content: 'Hey Alex! Catching a flight to Berlin. Listening to your latest ambient set.',
          messageType: 'text',
          reactions: { '💎': ['usr_me_001'] },
          status: 'read',
          createdAt: 'Yesterday',
        },
      ],
    };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('vibetalk_verifications');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('vibetalk_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(['usr_toxic_3']);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([
    'usr_clara_002',
    'usr_marcus_003',
    'usr_elena_004',
  ]);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>(['usr_julian_005']);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('vibetalk_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [filters, setFilters] = useState<DiscoverFilters>({
    searchQuery: '',
    minAge: 18,
    maxAge: 65,
    country: '',
    language: '',
    onlineOnly: false,
    verifiedOnly: false,
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('vibetalk_profiles', JSON.stringify(profiles));
    localStorage.setItem('vibetalk_conversations', JSON.stringify(conversations));
    localStorage.setItem('vibetalk_messages', JSON.stringify(chatMessages));
    localStorage.setItem('vibetalk_notifs', JSON.stringify(notifications));
    localStorage.setItem('vibetalk_reports', JSON.stringify(reports));
    localStorage.setItem('vibetalk_verifications', JSON.stringify(verificationRequests));
    localStorage.setItem('vibetalk_audits', JSON.stringify(auditLogs));
    localStorage.setItem('vibetalk_prefs', JSON.stringify(preferences));
  }, [profiles, conversations, chatMessages, notifications, reports, verificationRequests, auditLogs, preferences]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversationId ? chatMessages[activeConversationId] || [] : [];

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const sendMessage = (
    content: string,
    type: 'text' | 'image' | 'audio' | 'file' = 'text',
    mediaUrl?: string,
    replyToId?: string
  ) => {
    if (!activeConversationId || !currentUser) return;

    let replySnippet = undefined;
    if (replyToId) {
      const orig = messages.find((m) => m.id === replyToId);
      if (orig) {
        replySnippet = {
          senderName: orig.senderId === currentUser.id ? 'You' : activeConversation?.participant.firstName || 'Sender',
          text: orig.content.slice(0, 50),
        };
      }
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: currentUser.id,
      content,
      messageType: type,
      mediaUrl,
      audioDuration: type === 'audio' ? 18 : undefined,
      replyToId,
      replySnippet,
      reactions: {},
      status: 'sent',
      createdAt: 'Just now',
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
    }));

    // Update conversation metadata
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: newMessage,
              updatedAt: 'Just now',
            }
          : c
      )
    );

    // Simulate peer typing & response after short delay if chatting with Clara or Marcus
    if (activeConversation?.participant.id === 'usr_clara_002') {
      setTimeout(() => {
        const replyMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          conversationId: activeConversationId,
          senderId: 'usr_clara_002',
          content: 'That sounds delightful! Truly enjoying this conversation.',
          messageType: 'text',
          reactions: {},
          status: 'read',
          createdAt: 'Just now',
        };
        setChatMessages((prev) => ({
          ...prev,
          [activeConversationId]: [...(prev[activeConversationId] || []), replyMsg],
        }));
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, lastMessage: replyMsg, updatedAt: 'Just now' } : c
          )
        );
      }, 2500);
    }
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (!activeConversationId || !currentUser) return;
    setChatMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      const updated = currentList.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...m.reactions };
        const userList = currentReactions[emoji] || [];
        if (userList.includes(currentUser.id)) {
          // Toggle off
          currentReactions[emoji] = userList.filter((uid) => uid !== currentUser.id);
          if (currentReactions[emoji].length === 0) {
            delete currentReactions[emoji];
          }
        } else {
          // Toggle on
          currentReactions[emoji] = [...userList, currentUser.id];
        }
        return { ...m, reactions: currentReactions };
      });
      return { ...prev, [activeConversationId]: updated };
    });
  };

  const deleteMessage = (messageId: string, forEveryone: boolean = false) => {
    if (!activeConversationId) return;
    setChatMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      if (forEveryone) {
        return {
          ...prev,
          [activeConversationId]: currentList.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: 'This message was deleted.',
                  isDeletedForEveryone: true,
                  mediaUrl: undefined,
                }
              : m
          ),
        };
      } else {
        return {
          ...prev,
          [activeConversationId]: currentList.filter((m) => m.id !== messageId),
        };
      }
    });
  };

  const sendConnectionRequest = (targetUserId: string) => {
    if (connectedUserIds.includes(targetUserId) || pendingRequestIds.includes(targetUserId)) return;
    setPendingRequestIds((prev) => [...prev, targetUserId]);
    const targetUser = profiles.find((p) => p.id === targetUserId);

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: targetUserId,
      type: 'connection_request',
      title: 'Connection Request Sent',
      body: `You requested to connect with ${targetUser?.displayName || 'a member'}.`,
      isRead: false,
      createdAt: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const acceptConnectionRequest = (senderUserId: string) => {
    setPendingRequestIds((prev) => prev.filter((id) => id !== senderUserId));
    setConnectedUserIds((prev) => [...prev, senderUserId]);

    const sender = profiles.find((p) => p.id === senderUserId);
    if (sender) {
      // Create new conversation if doesn't exist
      const existing = conversations.find((c) => c.participant.id === senderUserId);
      if (!existing) {
        const newConv: Conversation = {
          id: `conv_${senderUserId}`,
          participant: sender,
          unreadCount: 0,
          updatedAt: 'Just now',
          lastMessage: {
            id: `msg_init_${Date.now()}`,
            conversationId: `conv_${senderUserId}`,
            senderId: sender.id,
            content: `Connected with ${sender.displayName}`,
            messageType: 'text',
            reactions: {},
            status: 'read',
            createdAt: 'Just now',
          },
        };
        setConversations((prev) => [newConv, ...prev]);
      }
    }
  };

  const removeConnection = (targetUserId: string) => {
    setConnectedUserIds((prev) => prev.filter((id) => id !== targetUserId));
  };

  const blockUser = (targetUserId: string, reason?: string) => {
    setBlockedUserIds((prev) => [...prev, targetUserId]);
    removeConnection(targetUserId);

    // Audit log
    const audit: AuditLogItem = {
      id: `log_${Date.now()}`,
      actorName: currentUser?.displayName || 'User',
      action: 'USER_BLOCKED',
      targetType: 'Profile',
      targetName: targetUserId,
      details: reason || 'User blocked via safety actions',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const unblockUser = (targetUserId: string) => {
    setBlockedUserIds((prev) => prev.filter((id) => id !== targetUserId));
  };

  const submitReport = (
    reportedUserId: string,
    category: ReportItem['category'],
    details: string,
    messageId?: string
  ) => {
    const reported = profiles.find((p) => p.id === reportedUserId);
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser?.id || 'usr_me_001',
      reporterName: currentUser?.displayName || 'Alex Rivers',
      reportedUserId,
      reportedName: reported?.displayName || 'Reported Member',
      category,
      details,
      status: 'pending',
      messageId,
      createdAt: 'Just now',
    };
    setReports((prev) => [newReport, ...prev]);

    // Audit log
    const audit: AuditLogItem = {
      id: `log_${Date.now()}`,
      actorName: currentUser?.displayName || 'User',
      action: 'SAFETY_REPORT_FILED',
      targetType: 'Profile',
      targetName: reported?.displayName || reportedUserId,
      details: `Filed report under category: ${category}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const submitVerificationRequest = (docType: 'government_id' | 'passport' | 'driving_license') => {
    if (!currentUser) return;
    const req: VerificationRequest = {
      id: `vr_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      documentType: docType,
      documentPreviewUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieUrl: currentUser.avatarUrl,
      status: 'pending',
      submittedAt: 'Just now',
    };
    setVerificationRequests((prev) => [req, ...prev]);
    updateCurrentUserProfile({ verificationStatus: 'pending' });
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Admin actions
  const adminVerifyUser = (userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, isVerified: true, verificationStatus: 'verified' } : p))
    );
    setVerificationRequests((prev) =>
      prev.map((vr) => (vr.userId === userId ? { ...vr, status: 'approved' } : vr))
    );
    if (currentUser?.id === userId) {
      updateCurrentUserProfile({ isVerified: true, verificationStatus: 'verified' });
    }
    const audit: AuditLogItem = {
      id: `log_${Date.now()}`,
      actorName: 'Admin',
      action: 'USER_VERIFIED',
      targetType: 'Profile',
      targetName: userId,
      details: 'Admin verified identity documents.',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const adminSuspendUser = (userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, moderationStatus: 'restricted' } : p))
    );
    const audit: AuditLogItem = {
      id: `log_${Date.now()}`,
      actorName: 'Admin',
      action: 'USER_SUSPENDED_24H',
      targetType: 'Profile',
      targetName: userId,
      details: 'Restricted messaging and calling capabilities.',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const adminBanUser = (userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, moderationStatus: 'blocked' } : p))
    );
    const audit: AuditLogItem = {
      id: `log_${Date.now()}`,
      actorName: 'Admin',
      action: 'USER_PERMANENT_BAN',
      targetType: 'Profile',
      targetName: userId,
      details: 'Permanently banned due to safety policy violation.',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const adminResolveReport = (reportId: string, resolution: 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: resolution } : r))
    );
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (currentUser) {
      updateCurrentUserProfile({ subscriptionTier: tier });
    }
  };

  const downloadMyData = () => {
    if (!currentUser) return;
    const userDataExport = {
      profile: currentUser,
      preferences,
      connections: connectedUserIds,
      notifications,
      exportTimestamp: new Date().toISOString(),
      privacyStatement: 'This export contains all personal records stored on VibeTalk.',
    };

    const blob = new Blob([JSON.stringify(userDataExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibetalk-userdata-${currentUser.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SocialContext.Provider
      value={{
        profiles,
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        notifications,
        reports,
        verificationRequests,
        auditLogs,
        blockedUserIds,
        connectedUserIds,
        pendingRequestIds,
        preferences,
        filters,
        unreadNotificationsCount,
        unreadMessagesCount,
        setFilters,
        setActiveConversationId,
        sendMessage,
        reactToMessage,
        deleteMessage,
        sendConnectionRequest,
        acceptConnectionRequest,
        removeConnection,
        blockUser,
        unblockUser,
        submitReport,
        submitVerificationRequest,
        updatePreferences,
        markNotificationRead,
        clearAllNotifications,
        adminVerifyUser,
        adminSuspendUser,
        adminBanUser,
        adminResolveReport,
        upgradeSubscription,
        downloadMyData,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
