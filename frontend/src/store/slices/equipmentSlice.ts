import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../types';
import { Equipment } from '../../types';
import { equipmentAPI } from '../../services/api';

interface EquipmentState {
  items: Equipment[];
  loading: boolean;
  error: string | null;
  selectedEquipment: Equipment | null;
}

const initialState: EquipmentState = {
  items: [],
  loading: false,
  error: null,
  selectedEquipment: null,
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    fetchEquipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEquipmentSuccess: (state, action: PayloadAction<Equipment[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    fetchEquipmentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedEquipment: (state, action: PayloadAction<Equipment | null>) => {
      state.selectedEquipment = action.payload;
    },
    fetchEquipmentByIdSuccess: (state, action: PayloadAction<Equipment | null>) => {
      state.selectedEquipment = action.payload;
      state.loading = false;
    },
    addEquipment: (state, action: PayloadAction<Equipment>) => {
      state.items.push(action.payload);
    },
    updateEquipment: (state, action: PayloadAction<Equipment>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteEquipment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const equipment = state.items.find(item => item.id === id);
      if (equipment) {
        equipment.availableQuantity = quantity;
      }
    }
  }
});

export const {
  fetchEquipmentStart,
  fetchEquipmentSuccess,
  fetchEquipmentFailure,
  setSelectedEquipment,
  fetchEquipmentByIdSuccess,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  updateQuantity
} = equipmentSlice.actions;

// Async action to fetch equipment
export const fetchEquipment = (): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchEquipmentStart());
    const equipment = await equipmentAPI.getAll();
    dispatch(fetchEquipmentSuccess(equipment));
  } catch (error) {
    dispatch(fetchEquipmentFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Async action to get equipment by ID
export const getEquipmentById = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchEquipmentStart());
    const equipment = await equipmentAPI.getById(id);
    dispatch(fetchEquipmentByIdSuccess(equipment));
  } catch (error) {
    dispatch(fetchEquipmentFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Async action to create equipment
export const createEquipment = (equipmentData: Omit<Equipment, 'id' | 'createdAt'>): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchEquipmentStart());
    const equipment = await equipmentAPI.create({
      ...equipmentData,
      createdAt: new Date().toISOString()
    });
    dispatch(addEquipment(equipment));
    dispatch(fetchEquipment()); // Refresh the equipment list
  } catch (error) {
    dispatch(fetchEquipmentFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Async action to update equipment
export const updateEquipmentById = (id: string, equipmentData: Omit<Equipment, 'id'>): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchEquipmentStart());
    const equipment = await equipmentAPI.update(id, equipmentData);
    dispatch(updateEquipment(equipment));
    dispatch(fetchEquipment()); // Reload lại danh sách sau khi cập nhật
  } catch (error) {
    dispatch(fetchEquipmentFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

// Async action to delete equipment
export const deleteEquipmentById = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(fetchEquipmentStart());
    await equipmentAPI.delete(id);
    dispatch(deleteEquipment(id));
    dispatch(fetchEquipment()); // Reload lại danh sách sau khi xóa
  } catch (error) {
    dispatch(fetchEquipmentFailure(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'));
  }
};

export default equipmentSlice.reducer;