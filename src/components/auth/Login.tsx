import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import loginIllustration from "../../assets/login-illustration.svg";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/products");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* Left Side - Login Form */}
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
                Welcome To Chimba de App Buñuelo y Tinto, 5 pa todos
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
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  variant="outlined"
                  placeholder="Enter your email"
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
                sx={{
                  mb: 2,
                  height: "52px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Sign in
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

        {/* Right Side - Illustration */}
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
