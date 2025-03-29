import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.API_URL) ||
  (window as any).env?.API_URL ||
  "http://web-nlb-1ff1424ac6da9897.elb.us-east-1.amazonaws.com";

const steps = ["Order Placed", "Preparing", "Ready for Pickup"];

const ORDER_STATUS = {
  ORDERED: 1,
  PREPARING: 2,
  READY: 3,
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  created_by?: number;
  updated_by?: number;
}

interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: null | string;
  total: string;
  status: number;
  product: Product;
  user: number;
  created_by?: number;
  updated_by?: number;
}

export const OrderConfirmation: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getAuthToken = (): string | undefined => {
    return Cookies.get("access_token");
  };

  const setupAxiosAuth = (): boolean => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return true;
    }
    return false;
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) return false;

    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      Cookies.set("access_token", response.data.access, {
        path: "/",
        secure: window.location.protocol === "https:",
        sameSite: "strict",
      });

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  };

  const mapStatusToStep = (statusId: number): number => {
    switch (statusId) {
      case ORDER_STATUS.ORDERED:
        return 0;
      case ORDER_STATUS.PREPARING:
        return 1;
      case ORDER_STATUS.READY:
        return 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = getAuthToken();
      if (!accessToken) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate("/products");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        setupAxiosAuth();
        const response = await axios.get(
          `${API_URL}/api/products/${productId}/`
        );
        setProduct(response.data);
      } catch (error: any) {
        console.error("Error fetching product:", error);

        if (error.response?.status === 401) {
          const refreshed = await refreshAuthToken();

          if (refreshed) {
            try {
              const retryResponse = await axios.get(
                `${API_URL}/api/products/${productId}/`
              );
              setProduct(retryResponse.data);
            } catch (retryError) {
              console.error("Error after token refresh:", retryError);
              setError("Failed to load product details. Please try again.");
              setTimeout(() => navigate("/products"), 2000);
            }
          } else {
            setError("You are not authorized. Please log in again.");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          setError("Failed to load product details. Please try again.");
          setTimeout(() => navigate("/products"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const createOrder = async () => {
    if (!product) return;

    setCreatingOrder(true);
    setError(null);

    try {
      setupAxiosAuth();

      const orderData = {
        product: product.id,
        status: ORDER_STATUS.ORDERED,
      };

      const response = await axios.post(`${API_URL}/api/orders/`, orderData);
      const newOrder = response.data;

      console.log("Order created:", newOrder);

      setOrder(newOrder);
      setActiveStep(mapStatusToStep(newOrder.status));

      if (newOrder.id) {
        setTimeout(async () => {
          try {
            await updateOrderStatusWithData(
              newOrder.id,
              ORDER_STATUS.PREPARING,
              newOrder
            );
            setTimeout(async () => {
              try {
                const currentOrder = order || newOrder;
                await updateOrderStatusWithData(
                  newOrder.id,
                  ORDER_STATUS.READY,
                  currentOrder
                );
              } catch (error) {
                console.error("Error updating to READY:", error);
              }
            }, 3000);
          } catch (error) {
            console.error("Error updating to PREPARING:", error);
          }
        }, 3000);
      }

    } catch (error) {
    }
  };

  const updateOrderStatusWithData = async (
    orderId: number,
    newStatus: number,
    orderData: Order
  ): Promise<void> => {
    setUpdatingStatus(true);
    setError(null);

    try {
      setupAxiosAuth();
      console.log("Updating order with data:", orderData);
      const updateData = {
        status: newStatus,
        ...(orderData.product && typeof orderData.product === "object"
          ? { product: orderData.product.id }
          : { product: orderData.product }),

        ...(orderData.total ? { total: orderData.total } : {}),
        ...(orderData.created_by
          ? { created_by: orderData.created_by }
          : { created_by: 1 }),
        ...(orderData.updated_by
          ? { updated_by: orderData.updated_by }
          : { updated_by: 1 }),
      };

      console.log("Update payload:", updateData);

      const response = await axios.put(
        `${API_URL}/api/orders/${orderId}/`,
        updateData
      );

      console.log("Update response:", response.data);

      setOrder(response.data);
      setActiveStep(mapStatusToStep(newStatus));
    } catch (error: any) {
      console.error("Error updating order status:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      if (error.response?.status === 401) {
        const refreshed = await refreshAuthToken();

        if (refreshed) {
          try {
            const updateData = {
              status: newStatus,
              ...(orderData.product && typeof orderData.product === "object"
                ? { product: orderData.product.id }
                : { product: orderData.product }),
              ...(orderData.total ? { total: orderData.total } : {}),
              created_by: orderData.created_by || 1,
              updated_by: orderData.updated_by || 1,
            };

            const retryResponse = await axios.put(
              `${API_URL}/api/orders/${orderId}/`,
              updateData
            );

            setOrder(retryResponse.data);
            setActiveStep(mapStatusToStep(newStatus));
          } catch (retryError) {
            console.error("Error after token refresh:", retryError);
            setError("Failed to update order status. Please try again.");
            return Promise.reject(retryError);
          }
        } else {
          setError("You are not authorized. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
          return Promise.reject("Authorization failed");
        }
      } else {
        setError("Failed to update order status. Please try again.");
        return Promise.reject(error);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!product && !error) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Product not found. Redirecting...</Typography>
      </Box>
    );
  }

  const subtotal = product ? parseFloat(product.price) : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Container
          maxWidth={false}
          sx={{ width: "100%", px: { xs: 2, sm: 4 } }}
        >
          <Toolbar
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
              px: 0,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/products")}
              sx={{ mr: 2, textTransform: "none" }}
            >
              Back to Menu
            </Button>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
            >
              Order Confirmation
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 8 },
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", maxWidth: "800px", mb: 4 }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px", md: "800px" },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              width: "100%",
              "& .MuiStepLabel-root .Mui-completed": {
                color: "primary.main",
              },
              "& .MuiStepLabel-root .Mui-active": {
                color: "primary.main",
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {product && (
            <Card
              sx={{
                width: "100%",
                borderRadius: "16px",
                boxShadow: (theme) => theme.shadows[2],
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Order Details
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 2, sm: 3 },
                      mb: 3,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Box
                      component="img"
                      src={product.image}
                      alt={product.name}
                      sx={{
                        width: { xs: "100%", sm: 80 },
                        height: { xs: 200, sm: 80 },
                        borderRadius: "12px",
                        objectFit: "cover",
                      }}
                    />
                    <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography color="text.secondary">Tax</Typography>
                    <Typography>${tax.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 0 && !order && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={createOrder}
              disabled={creatingOrder}
              sx={{
                height: { xs: "48px", sm: "56px" },
                borderRadius: "12px",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                textTransform: "none",
              }}
            >
              {creatingOrder ? "Processing..." : "Confirm Order"}
            </Button>
          )}

          {activeStep === 1 && (
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
                p: { xs: 2, sm: 4 },
                bgcolor: "primary.light",
                borderRadius: "12px",
              }}
            >
              <Typography variant="h6" sx={{ color: "primary.contrastText" }}>
                {updatingStatus
                  ? "Updating order status..."
                  : "Your order is being prepared..."}
              </Typography>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
              >
                Your order is ready for pickup!
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate("/products")}
                sx={{
                  height: { xs: "48px", sm: "56px" },
                  borderRadius: "12px",
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  textTransform: "none",
                }}
              >
                Back to Menu
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};
