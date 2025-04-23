import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, LoginCredentials, RegisterCredentials } from "@shared/schema";

// Set token
const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove token
const removeToken = () => {
  localStorage.removeItem("token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      
      // Store token
      setToken(data.token);
      
      return data.user as User;
    },
    onSuccess: (user) => {
      // Update user query data
      queryClient.setQueryData(["/api/auth/me"], user);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      const data = await res.json();
      
      // Store token
      setToken(data.token);
      
      return data.user as User;
    },
    onSuccess: (user) => {
      // Update user query data
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });
};

// Logout function
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Remove token
    removeToken();
    
    // Clear user data
    queryClient.setQueryData(["/api/auth/me"], null);
    
    // Clear other query cache
    queryClient.clear();
  };
};

// Get current user query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Check if user is admin
export const useIsAdmin = () => {
  const { data: user } = useCurrentUser();
  
  return user?.role === "admin";
};
