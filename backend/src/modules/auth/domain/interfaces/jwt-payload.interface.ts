// Contract for the JWT token payload (EIE-016)
export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: string;
  iat?: number; // issued at (auto-added by JwtService)
  exp?: number; // expiration (auto-added by JwtService)
}
