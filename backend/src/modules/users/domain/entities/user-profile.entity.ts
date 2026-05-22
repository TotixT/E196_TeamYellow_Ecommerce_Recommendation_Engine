// Domain entity — NO framework imports allowed here (EIE-019)

export class UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
