import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Container,
  Stack,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await register(username, email, password);
      navigate("/products");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Create Account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
              />

              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 2,
                  height: "48px",
                }}
              >
                REGISTER
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link href="/login" underline="hover">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
