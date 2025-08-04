// lib/userStore.ts
import { create } from 'zustand';
import { Database } from './database/schema';
import type { User } from './database/schema';

interface UserStore {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // User management
  initializeUser: (puterUser: any, kv: any) => Promise<User>;
  updateSubscription: (tier: 'free' | 'pro' | 'enterprise', subscriptionId?: string) => Promise<void>;
  
  // Usage tracking
  canUseFeature: (feature: string) => boolean;
  getDailyUsageCount: () => Promise<number>;
  recordAnalysis: (aiProvider: 'puter' | 'openai' | 'claude') => Promise<void>;
  
  // Premium features
  isPremium: () => boolean;
  isTrialActive: () => boolean;
  daysLeftInTrial: () => number;
  
  // Clear state
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  initializeUser: async (puterUser, kv) => {
    set({ isLoading: true, error: null });
    
    try {
      const db = new Database(kv);
      let user = await db.getUserByPuterUuid(puterUser.uuid);
      
      if (!user) {
        // Create new user starting with free tier
        user = await db.createUser({
          puterUuid: puterUser.uuid,
          email: puterUser.email || '',
          username: puterUser.username,
          subscriptionTier: 'free', // Start with free tier
          subscriptionStatus: 'active' // Active free account
        });
      }
      
      set({ currentUser: user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize user';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateSubscription: async (tier, subscriptionId) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');
    
    set({ isLoading: true, error: null });
    
    try {
      // This would typically involve your payment processor
      const updatedUser: User = {
        ...currentUser,
        subscriptionTier: tier,
        subscriptionStatus: tier === 'free' ? 'active' : 'active',
        subscriptionId,
        trialEndsAt: undefined, // Clear trial when upgrading
        subscriptionEndsAt: tier === 'free' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        updatedAt: new Date()
      };
      
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  canUseFeature: (feature: string) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    
    const isPremiumUser = get().isPremium();
    const isTrialActive = get().isTrialActive();
    
    switch (feature) {
      case 'unlimited_analysis':
        return isPremiumUser || isTrialActive;
      case 'premium_templates':
        return isPremiumUser || isTrialActive;
      case 'export_options':
        return isPremiumUser || isTrialActive;
      case 'priority_support':
        return isPremiumUser || isTrialActive;
      case 'bulk_analysis':
        return currentUser.subscriptionTier === 'enterprise';
      case 'team_dashboard':
        return currentUser.subscriptionTier === 'enterprise';
      default:
        return true; // Free features
    }
  },

  getDailyUsageCount: async () => {
    const { currentUser } = get();
    if (!currentUser) return 0;
    
    // For now, return from local storage
    // In production, you'd fetch from your database
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage_${currentUser.id}_${today}`;
    return parseInt(localStorage.getItem(usageKey) || '0');
  },

  recordAnalysis: async (aiProvider) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    // Record in local storage for now
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage_${currentUser.id}_${today}`;
    const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
    localStorage.setItem(usageKey, String(currentUsage + 1));
    
    // Also record the AI provider used
    const providerKey = `provider_${currentUser.id}_${today}`;
    localStorage.setItem(providerKey, aiProvider);
  },

  isPremium: () => {
    const { currentUser } = get();
    if (!currentUser) return false;
    
    return (
      currentUser.subscriptionTier !== 'free' && 
      currentUser.subscriptionStatus === 'active'
    ) || get().isTrialActive();
  },

  isTrialActive: () => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.trialEndsAt) return false;
    
    return new Date() < new Date(currentUser.trialEndsAt);
  },

  daysLeftInTrial: () => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.trialEndsAt) return 0;
    
    const now = new Date();
    const trialEnd = new Date(currentUser.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  clearUser: () => {
    set({ currentUser: null, isLoading: false, error: null });
  }
}));

// Helper hook for common user checks
export const useUserPermissions = () => {
  const store = useUserStore();
  
  return {
    canAnalyze: async () => {
      if (store.isPremium()) return true;
      
      const usage = await store.getDailyUsageCount();
      return usage < 3; // Free tier limit
    },
    
    getAnalysisLimitInfo: async () => {
      const isPremium = store.isPremium();
      const usage = await store.getDailyUsageCount();
      
      if (isPremium) {
        return { unlimited: true, used: usage, remaining: 'unlimited' };
      }
      
      return { unlimited: false, used: usage, remaining: Math.max(0, 3 - usage) };
    },
    
    shouldShowUpgrade: async () => {
      if (store.isPremium()) return false;
      
      const usage = await store.getDailyUsageCount();
      return usage >= 2; // Show upgrade prompt when close to limit
    }
  };
};