import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IAuthState = {
  organizationId: string;
  organizationName: string;
  credentialToken: string;
  merchantToken: string;
  authCredential: string;
  isAuthenticated: boolean;
  setCredentialToken: (token: string) => void;
  setOrganization: (org: {
    organizationId: string;
    organizationName: string;
  }) => void;
  setMerchantToken: (token: string) => void;
  setAuthCredential: (token: string) => void;
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
      authCredential: '',
      isAuthenticated: false,

      setCredentialToken: (token: string) => set({ credentialToken: token }),

      setOrganization: ({ organizationId, organizationName }) =>
        set({
          organizationId,
          organizationName,
        }),

      setMerchantToken: (token: string) => set({ merchantToken: token }),

      setAuthCredential: (token: string) => set({ authCredential: token }),

      setAuthenticated: () => set({ isAuthenticated: true }),

      logout: () =>
        set({
          organizationId: '',
          organizationName: '',
          isAuthenticated: false,
          credentialToken: '',
          merchantToken: '',
          authCredential: '',
        }),
    }),
    {
      name: 'zonos-auth',
    },
  ),
);
