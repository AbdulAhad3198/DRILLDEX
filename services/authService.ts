import { createClient } from '@/lib/supabase/client';

export type UserRole = 'Drilling Engineer' | 'Geologist' | 'Data Analyst' | 'Admin' | 'Viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: 'Active' | 'Pending' | 'Disabled';
  lastLogin?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  message?: string;
}

// Key for local session fallback when Supabase keys are not provided
const LOCAL_STORAGE_SESSION_KEY = 'nwis_demo_auth_session';

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_8820',
  email: 'engineer@nwisdemo.com',
  fullName: 'Senior Drilling Engineer',
  role: 'Drilling Engineer',
  status: 'Active',
  lastLogin: new Date().toISOString(),
  createdAt: '2026-01-15T08:00:00Z',
};

export const authService = {
  /**
   * Check if Supabase is properly configured with env vars
   */
  isSupabaseConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  },

  /**
   * Helper to format human-readable error messages from Supabase
   */
  formatAuthError(errorMsg: string): string {
    const lower = errorMsg.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
      return 'Email or password is incorrect.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (lower.includes('user already registered') || lower.includes('already_exists')) {
      return 'An account with this email address already exists.';
    }
    if (lower.includes('password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (lower.includes('fetch failed') || lower.includes('networkerror')) {
      return 'Unable to connect to the authentication service. Please try again.';
    }
    return 'Unable to process your request right now. Please try again.';
  },

  /**
   * Sign In User
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email ID.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Use Supabase if configured
    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          return { success: false, error: this.formatAuthError(error.message) };
        }

        const user = data.user;
        const profile: UserProfile = {
          id: user.id,
          email: user.email || trimmedEmail,
          fullName: user.user_metadata?.full_name || 'Drilling Engineer',
          role: (user.user_metadata?.role as UserRole) || 'Drilling Engineer',
          status: 'Active',
          lastLogin: new Date().toISOString(),
          createdAt: user.created_at,
        };

        // Save login details in Supabase database table
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || trimmedEmail,
            full_name: profile.fullName,
            role: profile.role,
            status: 'Active',
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch {
          // Table may not exist or have RLS restrictions, ignore gracefully
        }

        return { success: true, user: profile };
      }
    }

    // Fallback: Local Session Mode (for sandbox preview without Supabase credentials)
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const demoProfile: UserProfile = {
      ...DEFAULT_DEMO_USER,
      email: trimmedEmail,
      lastLogin: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(demoProfile));
      document.cookie = 'nwis_session_token=active; path=/; max-age=86400; SameSite=Lax';
    }

    return { success: true, user: demoProfile };
  },

  /**
   * Sign Up User
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email ID.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'Drilling Engineer',
            },
          },
        });

        if (error) {
          return { success: false, error: this.formatAuthError(error.message) };
        }

        // Save new user profile to Supabase database table
        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: trimmedEmail,
              full_name: fullName.trim(),
              role: 'Drilling Engineer',
              status: 'Active',
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch {
            // Ignore if profiles table does not exist
          }
        }

        if (data.user && !data.session) {
          return {
            success: true,
            message: 'Account created. Please check your email to verify your account or sign in directly.',
          };
        }

        const user = data.user!;
        const profile: UserProfile = {
          id: user.id,
          email: user.email || trimmedEmail,
          fullName: fullName.trim(),
          role: 'Drilling Engineer',
          status: 'Active',
          lastLogin: new Date().toISOString(),
          createdAt: user.created_at,
        };

        return { success: true, user: profile };
      }
    }

    // Fallback Local Registration Mode
    const newProfile: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: trimmedEmail,
      fullName: fullName.trim(),
      role: 'Drilling Engineer',
      status: 'Active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newProfile));
      document.cookie = 'nwis_session_token=active; path=/; max-age=86400; SameSite=Lax';
    }

    return { success: true, user: newProfile };
  },

  /**
   * Send Forgot Password Reset Email
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email ID.' };
    }

    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
        });

        if (error) {
          return { success: false, error: this.formatAuthError(error.message) };
        }
      }
    }

    return {
      success: true,
      message: 'If an account exists for this email, password reset instructions have been sent.',
    };
  },

  /**
   * Update Password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: this.formatAuthError(error.message) };
        }
      }
    }

    return { success: true, message: 'Password updated successfully.' };
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      document.cookie = 'nwis_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },

  /**
   * Get Current Session User
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (this.isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          return {
            id: data.user.id,
            email: data.user.email || 'engineer@nwisdemo.com',
            fullName: data.user.user_metadata?.full_name || 'Drilling Engineer',
            role: (data.user.user_metadata?.role as UserRole) || 'Drilling Engineer',
            status: 'Active',
            lastLogin: data.user.last_sign_in_at || new Date().toISOString(),
            createdAt: data.user.created_at,
          };
        }
        return null;
      }
    }

    // Fallback: local session check
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
      return null;
    }

    return null;
  },
};
