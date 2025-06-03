// File: src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  _id: string;
  email: string;
  name: string;
  role: {
    _id: string;
    name: string;
    permissions: string[];
  };
  access_token: string;
}

const initialState: UserState = {
  _id: '',
  email: '',
  name: '',
  role: { _id: '', name: '', permissions: [] },
  access_token: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;