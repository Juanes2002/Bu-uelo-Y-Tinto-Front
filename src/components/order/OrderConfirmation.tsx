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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import { Product } from "../../data/products";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

const steps = ["Order Placed", "Preparing", "Ready for Pickup"];

export const OrderConfirmation: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) {
      navigate("/products");
      return;
    }
    setProduct(selectedProduct);
  }, [productId, navigate]);

  const handleConfirmOrder = () => {
    // In a real app, this would make an API call to create the order
    setActiveStep(1);
    // Simulate order preparation
    setTimeout(() => {
      setActiveStep(2);
    }, 3000);
  };

  if (!product) {
    return null;
  }

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
      {/* Header */}
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

      {/* Main Content */}
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
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px", md: "800px" },
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Stepper */}
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

          {/* Order Details Card */}
          <Card
            sx={{
              width: "100%",
              borderRadius: "16px",
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Product Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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

              {/* Price Summary */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>${product.price.toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography color="text.secondary">Tax</Typography>
                  <Typography>${(product.price * 0.1).toFixed(2)}</Typography>
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
                    ${(product.price * 1.1).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {activeStep === 0 && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleConfirmOrder}
              sx={{
                height: { xs: "48px", sm: "56px" },
                borderRadius: "12px",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                textTransform: "none",
              }}
            >
              Confirm Order
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
                Your order is being prepared...
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
