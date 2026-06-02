import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async findAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },
  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
