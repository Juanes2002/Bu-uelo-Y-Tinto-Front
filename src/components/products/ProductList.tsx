import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Modal,
  IconButton,
  InputAdornment,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { products } from "../../data/products";
import { useNavigate } from "react-router-dom";

interface NewProduct {
  name: string;
  description: string;
  price: string;
  image: string;
  category: "food" | "drink";
}

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "food",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the new product
    console.log("New product:", newProduct);
    handleClose();
  };

  const handleOrderClick = (productId: string) => {
    navigate(`/order/${productId}`);
  };

  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}
    >
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Container maxWidth={false}>
          <Toolbar
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: "text.primary", fontWeight: 600 }}
            >
              Chimba de App Buñuelo y Tinto
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              Add Product
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 6, md: 10 },
          mb: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 4,
              fontWeight: 700,
              textAlign: "center",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            DIscover our menu!
          </Typography>
          <Box
            sx={{
              maxWidth: "800px",
              width: "100%",
              mx: "auto",
              px: { xs: 2, sm: 4 },
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for food..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "background.paper",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Product Grid */}
      <Container
        maxWidth={false}
        sx={{
          mb: 8,
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: "2000px",
          mx: "auto",
        }}
      >
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={product.image}
                  alt={product.name}
                  sx={{
                    objectFit: "cover",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.25rem",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      minHeight: "3em",
                      lineHeight: 1.5,
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: "auto",
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="p"
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: "1.25rem",
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => handleOrderClick(product.id)}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                      }}
                    >
                      Order Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Add Product Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-product-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "600px" },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Add New Product
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  multiline
                  rows={3}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    Add Product
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};
