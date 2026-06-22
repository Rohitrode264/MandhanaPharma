import React, { useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, FormControlLabel, Switch,
  Grid, CircularProgress, IconButton
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { tagService } from '../services/tag.service';
import { ProductStatus, ProductType } from '../types';
import api from '../utils/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  productType: z.nativeEnum(ProductType),
  strength: z.string().optional(),
  dosageForm: z.string().optional(),
  composition: z.string().optional(),
  packaging: z.object({
    size: z.string().optional(),
    type: z.string().optional(),
    unitCount: z.number().optional(),
  }).optional(),
  manufacturer: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  treatment: z.string().optional(),
  description: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  minOrderQuantity: z.number().optional(),
  pricing: z.object({
    currency: z.string().optional(),
    salePrice: z.number().optional(),
    mrp: z.number().optional(),
    unitLabel: z.string().optional(),
  }).optional(),
  inventory: z.object({
    isInStock: z.boolean().optional(),
    stockQty: z.number().optional(),
  }).optional(),
  images: z.array(z.object({
    url: z.string().url('Must be a valid URL'),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  additionalSpecs: z.array(z.object({
    label: z.string().min(1, 'Label is required'),
    value: z.string().min(1, 'Value is required'),
  })).optional(),
  seo: z.object({
    title: z.string().optional(),
    metaDescription: z.string().optional(),
  }).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  brochure: z.object({
    url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    publicId: z.string().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [uploadingIndex, setUploadingIndex] = React.useState<number | null>(null);
  const [uploadingBrochure, setUploadingBrochure] = React.useState<boolean>(false);

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue(`images.${index}.url`, response.data.data.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please check AWS S3 credentials and bucket configuration.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories });
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: tagService.getTags });
  
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: isEditing
  });

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', slug: '', category: '', tags: [], productType: ProductType.TABLET,
      status: ProductStatus.DRAFT, prescriptionRequired: false, minOrderQuantity: 1,
      packaging: { size: '', type: '', unitCount: 1 },
      pricing: { currency: 'INR', salePrice: 0, mrp: 0, unitLabel: '' },
      inventory: { isInStock: true, stockQty: 0 },
      images: [], additionalSpecs: [], seo: { title: '', metaDescription: '' },
      brochure: { url: '', publicId: '' }
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'additionalSpecs' });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        category: typeof product.category === 'object' ? product.category._id : product.category,
        tags: product.tags.map(t => typeof t === 'object' ? t._id : t),
      } as any);
    }
  }, [product, reset]);

  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<ProductFormData> }) => productService.updateProduct(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    }
  });

  const onSubmit = (data: ProductFormData) => {
    const cleanedData = { ...data };
    if (!cleanedData.brochure?.url) {
      delete cleanedData.brochure;
    }
    if (isEditing && id) {
      updateMutation.mutate({ id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData as any);
    }
  };

  if (isEditing && isProductLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/products')}><ArrowLeft /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{isEditing ? 'Edit Product' : 'Add New Product'}</Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Main Info Column */}
          <Grid size={{ xs: 12, md: 8 }}>

            {/* Basic Information */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="name" control={control} render={({ field }) => (
                    <TextField {...field} label="Product Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="slug" control={control} render={({ field }) => (
                    <TextField {...field} label="Slug" fullWidth error={!!errors.slug} helperText={errors.slug?.message} />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="genericName" control={control} render={({ field }) => (
                    <TextField {...field} label="Generic Name" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="brandName" control={control} render={({ field }) => (
                    <TextField {...field} label="Brand Name" fullWidth />
                  )}/>
                </Grid>
                <Grid size={12}>
                  <Controller name="description" control={control} render={({ field }) => (
                    <TextField {...field} label="Description" fullWidth multiline rows={4} />
                  )}/>
                </Grid>
              </Grid>
            </Paper>

            {/* Specifications */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Specifications</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller name="strength" control={control} render={({ field }) => (
                    <TextField {...field} label="Strength" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller name="dosageForm" control={control} render={({ field }) => (
                    <TextField {...field} label="Dosage Form" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller name="composition" control={control} render={({ field }) => (
                    <TextField {...field} label="Composition" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="manufacturer" control={control} render={({ field }) => (
                    <TextField {...field} label="Manufacturer" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="countryOfOrigin" control={control} render={({ field }) => (
                    <TextField {...field} label="Country of Origin" fullWidth />
                  )}/>
                </Grid>
                <Grid size={12}>
                  <Controller name="treatment" control={control} render={({ field }) => (
                    <TextField {...field} label="Treatment Focus" fullWidth />
                  )}/>
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Specs Dynamic Fields */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Additional Specifications</Typography>
                <Button startIcon={<Plus size={16} />} onClick={() => appendSpec({ label: '', value: '' })}>Add Spec</Button>
              </Box>
              {specFields.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Controller name={`additionalSpecs.${index}.label`} control={control} render={({ field }) => (
                    <TextField {...field} label="Label (e.g. Color)" size="small" sx={{ flex: 1 }} />
                  )}/>
                  <Controller name={`additionalSpecs.${index}.value`} control={control} render={({ field }) => (
                    <TextField {...field} label="Value" size="small" sx={{ flex: 2 }} />
                  )}/>
                  <IconButton color="error" onClick={() => removeSpec(index)}><Trash2 size={20} /></IconButton>
                </Box>
              ))}
            </Paper>

            {/* Images Dynamic Fields */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Images</Typography>
                <Button startIcon={<Plus size={16} />} onClick={() => appendImage({ url: '', alt: '', isPrimary: false })}>Add Image URL</Button>
              </Box>
              {imageFields.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Controller name={`images.${index}.url`} control={control} render={({ field }) => (
                    <TextField {...field} label="Image URL" size="small" sx={{ flex: 2 }} />
                  )}/>

                  {/* File Upload Button */}
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`image-upload-input-${index}`}
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                    />
                    <label htmlFor={`image-upload-input-${index}`}>
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        disabled={uploadingIndex === index}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {uploadingIndex === index ? 'Uploading...' : 'Upload File'}
                      </Button>
                    </label>
                  </Box>

                  <Controller name={`images.${index}.alt`} control={control} render={({ field }) => (
                    <TextField {...field} label="Alt Text" size="small" sx={{ flex: 1 }} />
                  )}/>
                  <Controller name={`images.${index}.isPrimary`} control={control} render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Primary" />
                  )}/>
                  <IconButton color="error" onClick={() => removeImage(index)}><Trash2 size={20} /></IconButton>
                </Box>
              ))}
            </Paper>

            {/* Brochure / PDF Upload */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Product Brochure (PDF)</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller name="brochure.url" control={control} render={({ field }) => (
                  <TextField {...field} label="Brochure PDF URL" size="small" sx={{ flex: 2 }} placeholder="https://..." value={field.value || ''} />
                )}/>
                
                <Box>
                  <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="brochure-upload-input"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingBrochure(true);
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const response = await api.post('/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          setValue('brochure.url', response.data.data.url);
                        } catch (err) {
                          console.error(err);
                          alert('Failed to upload PDF. Please check S3 settings.');
                        } finally {
                          setUploadingBrochure(false);
                        }
                      }
                    }}
                  />
                  <label htmlFor="brochure-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      disabled={uploadingBrochure}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {uploadingBrochure ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                  </label>
                </Box>
              </Box>
            </Paper>

          </Grid>

          {/* Sidebar Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            
            {/* Status & Organization */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Organization</Typography>
              
              <Controller name="status" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    {Object.values(ProductStatus).map((status) => (
                      <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}/>

              <Controller name="productType" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Product Type</InputLabel>
                  <Select {...field} label="Product Type">
                    {Object.values(ProductType).map((type) => (
                      <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}/>

              <Controller name="category" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {categories.map((c: any) => (
                      <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}/>

              <Controller name="tags" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tags</InputLabel>
                  <Select {...field} label="Tags" multiple value={Array.isArray(field.value) ? field.value : []}>
                    {tags.map((t: any) => (
                      <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}/>

              <Controller name="prescriptionRequired" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Prescription Required" />
              )}/>
            </Paper>

            {/* Packaging */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Packaging Details</Typography>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Controller name="packaging.type" control={control} render={({ field }) => (
                    <TextField {...field} label="Type (e.g. Box)" fullWidth />
                  )}/>
                </Grid>
                <Grid size={6}>
                  <Controller name="packaging.size" control={control} render={({ field }) => (
                    <TextField {...field} label="Size" fullWidth />
                  )}/>
                </Grid>
              </Grid>
            </Paper>

            {/* Submit Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/products')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </Box>

          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProductForm;
