import { useAuthContext } from '../context/AuthContext';

export { User } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
