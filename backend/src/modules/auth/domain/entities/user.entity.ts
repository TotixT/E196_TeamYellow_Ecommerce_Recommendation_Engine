// Domain entity — NO framework imports allowed here (EIE-019)

export enum UserRole {
  user = 'user',
  admin = 'admin',
}

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
}

export class User {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  city?: string;
  role: UserRole;
  status: UserStatus;
  failedAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
