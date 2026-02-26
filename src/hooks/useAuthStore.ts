import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IAuthState = {
  organizationId: string;
  organizationName: string;
  credentialToken: string;
  merchantToken: string;
  isAuthenticated: boolean;
  setCredentialToken: (token: string) => void;
  setOrganization: (org: {
    organizationId: string;
    organizationName: string;
  }) => void;
  setMerchantToken: (token: string) => void;
  setAuthenticated: () => void;
  logout: () => void;
};

export const useAuthStore = create<IAuthState>()(
  persist(
    set => ({
      organizationId: '',
      organizationName: '',
      credentialToken: '',
      merchantToken: '',
      isAuthenticated: false,

      setCredentialToken: (token: string) => set({ credentialToken: token }),

      setOrganization: ({ organizationId, organizationName }) =>
        set({
          organizationId,
          organizationName,
        }),

      setMerchantToken: (token: string) => set({ merchantToken: token }),

      setAuthenticated: () => set({ isAuthenticated: true }),

      logout: () =>
        set({
          organizationId: '',
          organizationName: '',
          isAuthenticated: false,
          credentialToken: '',
          merchantToken: '',
        }),
    }),
    {
      name: 'zonos-auth',
    },
  ),
);
