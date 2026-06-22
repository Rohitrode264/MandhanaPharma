import React from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { ProductStatus } from '../types';

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Products</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />} 
          onClick={() => navigate('/products/new')}
          sx={{ borderRadius: 2 }}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No products found</TableCell></TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 'medium' }}>{product.name}</Typography>
                      {product.brandName && (
                        <Typography variant="caption" color="text.secondary">{product.brandName}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{product.productType}</TableCell>
                    <TableCell>{typeof product.category === 'object' ? product.category?.name : product.category}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status} 
                        color={getStatusColor(product.status)} 
                        size="small" 
                        sx={{ textTransform: 'capitalize', fontWeight: 'bold' }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/products/edit/${product._id}`)}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(product._id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Products;
