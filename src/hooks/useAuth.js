import { useAuthContext } from '../store/AuthContext';

export const useAuth = () => {
  const { user, loading, login, logout, updateUser, isAuthenticated } = useAuthContext();
  return { user, loading, login, logout, updateUser, isAuthenticated };
};