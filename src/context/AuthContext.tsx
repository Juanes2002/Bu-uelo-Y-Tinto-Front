import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.API_URL) ||
    (window as any).env?.API_URL ||
    "http://localhost:8000";

  // Set up axios instance with authorization header
  const api = axios.create({
    baseURL: API_URL,
  });

  // Add interceptor to include the access token in requests
  api.interceptors.request.use(
    (config) => {
      if (tokens?.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add interceptor to handle token refresh on 401 errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh the token yet
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        tokens?.refresh
      ) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token with the exact format expected by your API
          const refreshResponse = await axios.post(
            `${API_URL}/token/refresh/`,
            {
              refresh: tokens.refresh,
            }
          );

          // Update tokens
          const newTokens = {
            ...tokens,
            access: refreshResponse.data.access,
          };
          setTokens(newTokens);

          // Save to localStorage
          localStorage.setItem("auth_tokens", JSON.stringify(newTokens));

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;

          return api(originalRequest);
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const fetchUser = async () => {
      const savedTokens = localStorage.getItem("auth_tokens");

      if (savedTokens) {
        try {
          const parsedTokens = JSON.parse(savedTokens) as AuthTokens;
          setTokens(parsedTokens);

          // Get user info using the access token
          const userResponse = await api.get("/users/me/");
          setUser(userResponse.data);
        } catch (error) {
          console.error("Error loading user:", error);
          // If token is invalid, clear storage
          localStorage.removeItem("auth_tokens");
          setTokens(null);
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
      });

      console.log("Login response:", response.data);

      const newTokens = {
        access: response.data.access,
        refresh: response.data.refresh,
      };

      setTokens(newTokens);
      localStorage.setItem("auth_tokens", JSON.stringify(newTokens));

      try {
        const userResponse = await api.get("/users/me/");
        setUser(userResponse.data);
        return userResponse.data;
      } catch (userError) {
        console.warn("Couldn't fetch user details:", userError);
        const basicUser = {
          id: "1",
          username: username,
          email: `${username}@example.com`,
        };
        setUser(basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await axios.post(`${API_URL}/users/register/`, {
        username,
        email,
        password,
      });

      await login(username, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("auth_tokens");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!tokens?.access,
        tokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
