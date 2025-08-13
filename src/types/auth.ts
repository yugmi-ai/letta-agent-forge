export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  organization?: Organization;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  preferences: UserPreferences;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  plan: OrganizationPlan;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: Date;
  invitedBy: string;
  user: User;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  USER = 'user'
}

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum OrganizationPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    agentUpdates: boolean;
    systemAlerts: boolean;
  };
}

export interface OrganizationSettings {
  allowMemberInvites: boolean;
  requireEmailVerification: boolean;
  maxAgentsPerUser: number;
  dataRetentionDays: number;
  allowedDomains: string[];
  ssoEnabled: boolean;
  auditLogsEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  acceptTerms: boolean;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  token: string;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  inviteUser: (email: string, role: OrganizationRole) => Promise<void>;
  acceptInvite: (token: string) => Promise<void>;
}