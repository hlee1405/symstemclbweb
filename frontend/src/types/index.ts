import { ThunkAction, Action } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export interface Auth {
  username: string;
  role: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl?: string;
  status: EquipmentStatus;
  condition: string;
  createdAt: string; // ISO date string
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  MAINTENANCE = 'MAINTENANCE'
}

export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  requestDate: string;
  borrowDate: string;
  returnDate: string;
  actualBorrowDate?: string;
  actualReturnDate?: string;
  approvedDate?: string;
  status: RequestStatus;
  notes?: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  CANCELED = 'CANCELED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

export interface EquipmentStats {
  equipmentId: string;
  equipmentName: string;
  totalBorrows: number;
  avgBorrowDuration: number;
}