import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch 
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryService } from '../services/category.service';
import { CategoryScope, type ICategory } from '../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  scope: z.nativeEnum(CategoryScope),
  description: z.string().optional(),
  parentCategory: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      scope: CategoryScope.DOMESTIC,
      description: '',
      parentCategory: null,
      isActive: true,
      sortOrder: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<ICategory> }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const handleOpenDialog = (category?: ICategory) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name: category.name,
        slug: category.slug,
        scope: category.scope,
        description: category.description || '',
        parentCategory: typeof category.parentCategory === 'string' ? category.parentCategory : category.parentCategory?._id || null,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      reset({
        name: '',
        slug: '',
        scope: CategoryScope.DOMESTIC,
        description: '',
        parentCategory: null,
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      ...data,
      parentCategory: data.parentCategory || undefined
    };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Categories</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />} 
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Category
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
              ) : categories.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No categories found</TableCell></TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{category.scope}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, py: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        bgcolor: category.isActive ? 'success.light' : 'error.light',
                        color: category.isActive ? 'success.dark' : 'error.dark'
                      }}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(category)}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(category._id)}>
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

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Slug" fullWidth error={!!errors.slug} helperText={errors.slug?.message} />
              )}
            />
            <Controller
              name="scope"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Scope</InputLabel>
                  <Select {...field} label="Scope">
                    <MenuItem value={CategoryScope.DOMESTIC}>Domestic</MenuItem>
                    <MenuItem value={CategoryScope.INTERNATIONAL}>International</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="parentCategory"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Parent Category</InputLabel>
                  <Select {...field} label="Parent Category" value={field.value || ''}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {categories.filter(c => c._id !== editingCategory?._id).map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Description" fullWidth multiline rows={3} />
              )}
            />
            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="Sort Order" 
                  type="number" 
                  fullWidth 
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Active"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Categories;
