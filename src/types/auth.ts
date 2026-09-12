export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'apple';
}

export interface AuthSuccessResponse {
  token: string;
  user: UserSession;
}
