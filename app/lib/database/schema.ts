// lib/database/schema.ts
export interface User {
  id: string;
  puterUuid: string; // From Puter auth
  email: string;
  username: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trial';
  subscriptionId?: string; // Stripe subscription ID
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  analysisCount: number;
  aiProvider: 'puter' | 'openai' | 'claude';
  createdAt: Date;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  resumePath: string;
  imagePath: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  feedback: any;
  restructuredCV?: any;
  analysisType: 'free' | 'premium';
  aiProvider: 'puter' | 'openai' | 'claude';
  createdAt: Date;
}

export interface PremiumTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'creative' | 'technical' | 'ats-optimized';
  templateData: any;
  isActive: boolean;
  createdAt: Date;
}

// Database interface using Puter KV (simple key-value storage)
export class Database {
  constructor(private kv: any) {}

  // User management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.kv.set(`user:${user.id}`, JSON.stringify(user));
    await this.kv.set(`user:puter:${user.puterUuid}`, user.id); // Index by puter UUID
    
    return user;
  }

  async getUserByPuterUuid(puterUuid: string): Promise<User | null> {
    try {
      const userId = await this.kv.get(`user:puter:${puterUuid}`);
      if (!userId) return null;
      
      const userData = await this.kv.get(`user:${userId}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userData = await this.kv.get(`user:${userId}`);
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date()
      };
      
      await this.kv.set(`user:${userId}`, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Usage tracking
  async recordUsage(userId: string, aiProvider: 'puter' | 'openai' | 'claude'): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage:${userId}:${today}`;
    
    try {
      const existingUsage = await this.kv.get(usageKey);
      const usage: UsageRecord = existingUsage 
        ? JSON.parse(existingUsage)
        : {
            id: this.generateId(),
            userId,
            date: today,
            analysisCount: 0,
            aiProvider,
            createdAt: new Date()
          };
      
      usage.analysisCount++;
      await this.kv.set(usageKey, JSON.stringify(usage));
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  }

  async getDailyUsage(userId: string, date?: string): Promise<number> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const usageKey = `usage:${userId}:${targetDate}`;
    
    try {
      const usage = await this.kv.get(usageKey);
      return usage ? JSON.parse(usage).analysisCount : 0;
    } catch (error) {
      console.error('Error getting usage:', error);
      return 0;
    }
  }

  // Analysis history
  async saveAnalysis(analysisData: Omit<AnalysisHistory, 'id' | 'createdAt'>): Promise<AnalysisHistory> {
    const analysis: AnalysisHistory = {
      id: this.generateId(),
      ...analysisData,
      createdAt: new Date()
    };
    
    await this.kv.set(`analysis:${analysis.id}`, JSON.stringify(analysis));
    
    // Add to user's analysis list
    const userAnalysesKey = `user:${analysisData.userId}:analyses`;
    const existingAnalyses = await this.kv.get(userAnalysesKey);
    const analyses = existingAnalyses ? JSON.parse(existingAnalyses) : [];
    analyses.unshift(analysis.id); // Add to beginning
    
    // Keep only last 50 analyses
    if (analyses.length > 50) {
      analyses.splice(50);
    }
    
    await this.kv.set(userAnalysesKey, JSON.stringify(analyses));
    
    return analysis;
  }

  async getUserAnalyses(userId: string, limit: number = 10): Promise<AnalysisHistory[]> {
    try {
      const userAnalysesKey = `user:${userId}:analyses`;
      const analysisIds = await this.kv.get(userAnalysesKey);
      
      if (!analysisIds) return [];
      
      const ids = JSON.parse(analysisIds).slice(0, limit);
      const analyses: AnalysisHistory[] = [];
      
      for (const id of ids) {
        const analysisData = await this.kv.get(`analysis:${id}`);
        if (analysisData) {
          analyses.push(JSON.parse(analysisData));
        }
      }
      
      return analyses;
    } catch (error) {
      console.error('Error getting user analyses:', error);
      return [];
    }
  }

  // Premium templates
  async getPremiumTemplates(): Promise<PremiumTemplate[]> {
    try {
      const templatesData = await this.kv.get('premium:templates');
      return templatesData ? JSON.parse(templatesData) : this.getDefaultTemplates();
    } catch (error) {
      console.error('Error getting templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): PremiumTemplate[] {
    return [
      {
        id: 'ats-optimized',
        name: 'ATS-Optimized',
        description: 'Clean, keyword-friendly format that passes Applicant Tracking Systems',
        category: 'ats-optimized',
        templateData: { /* template configuration */ },
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'executive',
        name: 'Executive Leadership',
        description: 'Professional template for senior-level and C-suite positions',
        category: 'executive',
        templateData: { /* template configuration */ },
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'creative',
        name: 'Creative Professional',
        description: 'Modern design for creative and design roles',
        category: 'creative',
        templateData: { /* template configuration */ },
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'technical',
        name: 'Technical Specialist',
        description: 'Structured format highlighting technical skills and projects',
        category: 'technical',
        templateData: { /* template configuration */ },
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}