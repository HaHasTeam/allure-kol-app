import { createContext } from "react";
import type { GetRoleByEnumResponse, TRoleResponse } from "@/types/role";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Define the context type without any implementation
const AuthContext = createContext<{
  login: (
    email: string,
    password: string
  ) => Promise<boolean | string | undefined>;
  logout: () => Promise<string | undefined>;
  saveFirebaseToken: (
    firebaseToken: string
  ) => Promise<boolean | string | undefined>;
  removeFirebaseToken: () => Promise<boolean | string | undefined>;
  fetchRoles: () => Promise<TRoleResponse[]>;
  accessToken?: string | null;
  refreshToken?: string | null;
  firebaseToken?: string | null;
  setToken: (accessToken: string, refreshToken: string) => void;
  roles: TRoleResponse[];
  mappedRoles: GetRoleByEnumResponse;
  isLoadingRoles: boolean;
  getRoleByEnum?: (roleEnum: string) => TRoleResponse | undefined;
  getRoleNameByEnum?: (roleEnum: string) => string;
  isRolesLoaded?: () => boolean;
  firebaseUser: FirebaseAuthTypes.UserCredential | null;
}>({
  login: () => Promise.resolve(false),
  logout: () => Promise.resolve(""),
  saveFirebaseToken: () => Promise.resolve(false),
  removeFirebaseToken: () => Promise.resolve(false),
  accessToken: null,
  fetchRoles: async () => [],
  refreshToken: null,
  firebaseToken: null,
  setToken: () => {},
  isLoadingRoles: false,
  roles: [],
  mappedRoles: {},
  firebaseUser: null,
});

export default AuthContext;
