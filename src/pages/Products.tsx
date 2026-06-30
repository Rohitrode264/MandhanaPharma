import React from 'react';
import { 
  Box, Typography, Paper, Button, Chip, Card, CardContent, CardActions
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { ProductStatus } from '../types';
import Grid from '@mui/material/Grid';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.PUBLISHED: return 'success';
      case ProductStatus.DRAFT: return 'warning';
      case ProductStatus.ARCHIVED: return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your pharmaceutical inventory</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />} 
          onClick={() => navigate('/products/new')}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Add Product
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Loading products...</Typography>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No products found. Start by adding a new product.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} >
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{ 
                width: '100%',
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                position: 'relative', 
                overflow: 'visible',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ position: 'absolute', top: -12, right: 16, zIndex: 1 }}>
                  <Chip 
                    label={product.productType || 'TABLET'} 
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#146C94', 
                      fontWeight: 'bold', 
                      border: '1px solid #e0e0e0', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                      borderRadius: 1 
                    }} 
                  />
                </Box>
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: '1px solid #f0f0f0' }}>
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} style={{ height: 160, width: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', bgcolor: '#fafafa', width: '100%', borderRadius: 2 }}>No Image</Box>
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1, bgcolor: '#ffffff' }}>
                  <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 'bold', lineHeight: 1, display: 'block', mb: 0.5 }}>
                    {product.brandName || 'GENERIC'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0, lineHeight: 1.2, mb: 1, color: '#1a1a1a', fontSize: '1.1rem' }}>
                    {product.name}
                  </Typography>
                  
                  {product.composition && product.composition.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.composition.concat(' + ')}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {product.packaging?.size && (
                      <Chip size="small" label={product.packaging.size} sx={{ bgcolor: '#f3f4f6', color: '#4b5563', borderRadius: 1 }} />
                    )}
                    <Chip 
                      size="small" 
                      label={product.status} 
                      color={getStatusColor(product.status)} 
                      variant="outlined"
                      sx={{ borderRadius: 1, textTransform: 'capitalize' }}
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ borderTop: '1px solid #f0f0f0', p: 1.5, justifyContent: 'space-between', bgcolor: '#fafafa', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                  <Button 
                    size="small" 
                    startIcon={<Edit size={16} />} 
                    onClick={() => navigate(`/products/edit/${product._id}`)}
                    sx={{ color: '#146C94', fontWeight: 'bold', textTransform: 'none' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<Trash2 size={16} />} 
                    onClick={() => handleDelete(product._id)}
                    sx={{ fontWeight: 'bold', textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Products;

