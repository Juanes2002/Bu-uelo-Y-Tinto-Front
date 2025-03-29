import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.API_URL) ||
  (window as any).env?.API_URL ||
  "http://web-nlb-1ff1424ac6da9897.elb.us-east-1.amazonaws.com";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  created_by: number;
  updated_by: number;
}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "food",
  });

  const getAuthToken = (): string | undefined => {
    return Cookies.get('access_token');
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
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) return false;
    
    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      });
      
      Cookies.set('access_token', response.data.access, { 
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    console.log(API_URL)
    console.log(`${API_URL}/api/products/`)
    
    try {
      setupAxiosAuth();
      
      const response = await axios.get(`${API_URL}/api/products/`);
      console.log("API Response:", response.data);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.results)) {
          setProducts(response.data.results);
        } else if (response.data.id) {
          setProducts([response.data]);
        } else {
          const productsArray = Object.values(response.data).filter(
            item => item && typeof item === 'object' && 'id' in item
          ) as Product[];
          
          if (productsArray.length > 0) {
            setProducts(productsArray);
          } else {
            console.error("Unexpected API response structure:", response.data);
            setError("Error: Unexpected API response format");
            setProducts([]);
          }
        }
      } else {
        console.error("Unexpected API response:", response.data);
        setError("Error: Unexpected API response format");
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          const refreshed = await refreshAuthToken();
          
          if (refreshed) {
            try {
              const retryResponse = await axios.get(`${API_URL}/api/products/`);
              if (Array.isArray(retryResponse.data)) {
                setProducts(retryResponse.data);
              } else if (retryResponse.data && typeof retryResponse.data === 'object') {
                if (Array.isArray(retryResponse.data.results)) {
                  setProducts(retryResponse.data.results);
                } else if (retryResponse.data.id) {
                  setProducts([retryResponse.data]);
                } else {
                  const productsArray = Object.values(retryResponse.data).filter(
                    item => item && typeof item === 'object' && 'id' in item
                  ) as Product[];
                  
                  if (productsArray.length > 0) {
                    setProducts(productsArray);
                  } else {
                    console.error("Unexpected API response structure after refresh:", retryResponse.data);
                    setError("Error: Unexpected API response format");
                    setProducts([]);
                  }
                }
              } else {
                setProducts([]);
              }
              setError(null);
              setLoading(false);
              return;
            } catch (retryError) {
              console.error("Error after token refresh:", retryError);
            }
          }
          
          setError("You are not authorized. Please log in again.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(`Error: ${error.response.data.detail || 'Failed to fetch products'}`);
        }
      } else if (error.request) {
        setError("Server not responding. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setupAxiosAuth();
      
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image: newProduct.image,
        available: true,
      };
      
      await axios.post(`${API_URL}/api/products/`, productData);
      
      fetchProducts();
      
      handleClose();
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "food",
      });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleOrderClick = (productId: number) => {
    navigate(`/order/${productId}`);
  };

  const handleLogout = () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    Cookies.remove('username', { path: '/' });
    
    delete axios.defaults.headers.common["Authorization"];
    
    navigate("/login");
  };

  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                Logout
              </Button>
            </Box>
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
            Discover our menu!
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? "No products found matching your search." : "No products available."}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
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
                    opacity: product.available ? 1 : 0.7,
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
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="medium"
                        onClick={() => handleOrderClick(product.id)}
                        disabled={!product.available}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          px: 3,
                          py: 1,
                        }}
                      >
                        {product.available ? "Order Now" : "Not Available"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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