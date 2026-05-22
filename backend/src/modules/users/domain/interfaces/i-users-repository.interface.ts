import { UserProfile } from '../entities/user-profile.entity';

export interface PaginatedUsers {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersFilter {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUsersRepository {
  findById(id: number): Promise<UserProfile | null>;
  updateProfile(
    id: number,
    data: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'address' | 'city'>>,
  ): Promise<UserProfile>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  findPasswordHash(id: number): Promise<string | null>;
  listUsers(filter: UsersFilter): Promise<PaginatedUsers>;
  updateStatus(id: number, status: string): Promise<UserProfile>;
}
