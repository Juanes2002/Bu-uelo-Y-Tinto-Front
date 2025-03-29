import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import loginIllustration from "../../assets/login-illustration.svg";
import axios from "axios";
import Cookies from 'js-cookie';

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.API_URL) ||
  (window as any).env?.API_URL ||
  "http://web-nlb-1ff1424ac6da9897.elb.us-east-1.amazonaws.com";

interface AuthTokens {
  access: string;
  refresh: string;
}

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      
      if (accessToken && refreshToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        setIsAuthenticated(true);
        navigate("/products");
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
      });

      console.log("Login response:", response.data);

      const tokens: AuthTokens = {
        access: response.data.access,
        refresh: response.data.refresh,
      };

      const cookieOptions = {
        expires: rememberMe ? 30 : undefined,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict' as const,
        path: '/'
      };
      
      Cookies.set('access_token', tokens.access, cookieOptions);
      Cookies.set('refresh_token', tokens.refresh, cookieOptions);

      Cookies.set('username', username, cookieOptions);

      axios.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate("/products");
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setError(
            "Invalid credentials. Please check your username and password."
          );
        } else {
          setError(
            `Login failed: ${error.response.data.detail || "Unknown error"}`
          );
        }
      } else if (error.request) {
        setError("Server not responding. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}

      <Grid container sx={{ height: "100%" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, sm: 4, md: 6 },
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "440px",
            }}
          >
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                }}
              >
                Concert Menu App Buñuelo y tinto
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
              >
                Please enter your details
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  Username
                </Typography>
                <TextField
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  variant="outlined"
                  placeholder="Enter your username"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f8f9fa",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  variant="outlined"
                  placeholder="Enter your password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f8f9fa",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      sx={{
                        "&.Mui-checked": {
                          color: "primary.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Remember for 30 days
                    </Typography>
                  }
                />
                <Link
                  href="/forgot-password"
                  underline="hover"
                  sx={{
                    color: "primary.main",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  Forgot password
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  height: "52px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                sx={{
                  mb: 4,
                  height: "52px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderColor: "#e0e0e0",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "#bdbdbd",
                    bgcolor: "rgba(0, 0, 0, 0.01)",
                  },
                }}
              >
                Sign in with Google
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    underline="hover"
                    sx={{
                      color: "primary.main",
                      fontWeight: 500,
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            bgcolor: "primary.main",
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0.1,
              background:
                "repeating-linear-gradient(-45deg, #fff, #fff 1px, transparent 1px, transparent 12px)",
            }}
          />
          <Box
            component="img"
            src={loginIllustration}
            alt="Login illustration"
            sx={{
              width: "75%",
              maxWidth: "800px",
              height: "auto",
              position: "relative",
              zIndex: 1,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};