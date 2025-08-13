import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  SignupCredentials,
  User,
  Organization,
  OrganizationRole
} from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

// Mock API functions - replace with actual API calls
const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; organization?: Organization; token: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: true,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          agentUpdates: true,
          systemAlerts: true
        }
      }
    };

    return {
      user: mockUser,
      token: 'mock-jwt-token'
    };
  },

  async signup(credentials: SignupCredentials): Promise<{ user: User; organization?: Organization; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      role: 'user' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          agentUpdates: true,
          systemAlerts: true
        }
      }
    };

    let mockOrganization: Organization | undefined;
    
    if (credentials.organizationName) {
      mockOrganization = {
        id: '1',
        name: credentials.organizationName,
        slug: credentials.organizationName.toLowerCase().replace(/\s+/g, '-'),
        plan: 'free' as any,
        settings: {
          allowMemberInvites: true,
          requireEmailVerification: true,
          maxAgentsPerUser: 10,
          dataRetentionDays: 90,
          allowedDomains: [],
          ssoEnabled: false,
          auditLogsEnabled: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUser.id,
        members: []
      };
      
      mockUser.organizationId = mockOrganization.id;
      mockUser.organization = mockOrganization;
    }

    return {
      user: mockUser,
      organization: mockOrganization,
      token: 'mock-jwt-token'
    };
  },

  async refreshToken(): Promise<{ user: User; organization?: Organization; token: string }> {
    const token = localStorage.getItem('yugmi_token');
    if (!token) throw new Error('No token found');
    
    // Mock token refresh
    return this.login({ email: 'cached@example.com', password: '' });
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return updated user
    return { ...updates } as User;
  }
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; organization?: Organization } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SWITCH_ORGANIZATION'; payload: Organization };

const initialState: AuthState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SWITCH_ORGANIZATION':
      return {
        ...state,
        organization: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('yugmi_token');
    if (token) {
      dispatch({ type: 'LOGIN_START' });
      authApi.refreshToken()
        .then(({ user, organization }) => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, organization } });
        })
        .catch(() => {
          localStorage.removeItem('yugmi_token');
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
        });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, organization, token } = await authApi.login(credentials);
      localStorage.setItem('yugmi_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, organization } });
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, organization, token } = await authApi.signup(credentials);
      localStorage.setItem('yugmi_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, organization } });
      toast({
        title: 'Welcome to Yugmi!',
        description: 'Your account has been created successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast({
        title: 'Signup failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('yugmi_token');
    dispatch({ type: 'LOGOUT' });
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  const refreshToken = async () => {
    try {
      const { user, organization, token } = await authApi.refreshToken();
      localStorage.setItem('yugmi_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, organization } });
    } catch (error) {
      localStorage.removeItem('yugmi_token');
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(updates);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    // Mock implementation
    toast({
      title: 'Organization switched',
      description: 'Switched to new organization.',
    });
  };

  const inviteUser = async (email: string, role: OrganizationRole) => {
    // Mock implementation
    toast({
      title: 'Invitation sent',
      description: `Invitation sent to ${email}`,
    });
  };

  const acceptInvite = async (token: string) => {
    // Mock implementation
    toast({
      title: 'Invitation accepted',
      description: 'You have joined the organization.',
    });
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    signup,
    logout,
    refreshToken,
    updateProfile,
    switchOrganization,
    inviteUser,
    acceptInvite,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}