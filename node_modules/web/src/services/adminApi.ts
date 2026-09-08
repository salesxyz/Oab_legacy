import { apiRequest } from './httpClient';
import type { PublicUser, UserRole, UserStatus } from '../types/auth';

export interface AdminDashboardStats {
  totalStudents: number;
  activeStudents: number;
  publishedContents: number;
  answeredQuestions: number;
  averageAccuracyPercent: number;
  contentCompletionRatePercent: number;
  simulationsTaken: number;
  totalUsers: number;
  totalMentors: number;
  totalAdmins: number;
  approvedStudents: number;
  basicSubscriptions: number;
  lifetimeSubscriptions: number;
  expiredSubscriptions: number;
  database: { databaseName: string; databaseSize: string; userRecords: number; courseRecords: number; questionRecords: number; simulationRecords: number };
}

export interface AdminUser extends Pick<PublicUser, 'id' | 'name' | 'email' | 'role' | 'status'> {
  subscriptionPlan: PublicUser['subscriptionPlan'];
  accessExpiresAt: string | null;
  approved: boolean;
  approvedAt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUsersResponse { rows: AdminUser[]; total: number; }

export const adminApi = {
  getDashboard() { return apiRequest<AdminDashboardStats>('/admin/dashboard', { method: 'GET' }); },
  listUsers(search = '') {
    const params = new URLSearchParams({ page: '1', pageSize: '8' });
    if (search.trim()) params.set('search', search.trim());
    return apiRequest<AdminUsersResponse>(`/admin/users?${params.toString()}`, { method: 'GET' });
  },
  updateUserStatus(id: string, status: UserStatus) { return apiRequest<AdminUser>(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }); },
  updateUserRole(id: string, role: UserRole) { return apiRequest<AdminUser>(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }); },
  updateUserApproval(id: string, approved: boolean) { return apiRequest<AdminUser>(`/admin/users/${id}/approval`, { method: 'PATCH', body: { approved } }); },
};