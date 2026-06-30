import React, { useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, FormControlLabel, Switch,
  Grid, CircularProgress, IconButton, RadioGroup, Radio, FormLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, ArrowLeft, Eye } from 'lucide-react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { tagService } from '../services/tag.service';
import { ProductStatus, ProductType, ProductScope } from '../types';
import api from '../utils/api';

const STRENGTH_OPTIONS = ['50 mg', '25 mg', '60 mg'];
const PACKAGING_TYPE_OPTIONS = ['Bottle', 'Box'];
const PACKAGE_SIZE_OPTIONS = ['1* 50 Tablets', '1* 60 Tablets', '100 Tablets', '50 Tablets', '60 Tablets', '90 Tablets'];

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one Category is required'),
  tags: z.array(z.string()).optional(),
  productType: z.nativeEnum(ProductType),
  scope: z.nativeEnum(ProductScope),
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
  const [previewOpen, setPreviewOpen] = React.useState(false);
  
  const [isStrengthOther, setIsStrengthOther] = React.useState(false);
  const [isPkgTypeOther, setIsPkgTypeOther] = React.useState(false);
  const [isPkgSizeOther, setIsPkgSizeOther] = React.useState(false);

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setValue(`images.${index}.url` as any, response.data.data.url);
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

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', slug: '', categories: [], tags: [], productType: ProductType.TABLET,
      scope: ProductScope.DOMESTIC,
      status: ProductStatus.DRAFT, prescriptionRequired: false, minOrderQuantity: 1,
      packaging: { size: '', type: '', unitCount: 1 },
      pricing: { currency: 'INR', salePrice: 0, mrp: 0, unitLabel: '' },
      inventory: { isInStock: true, stockQty: 0 },
      images: [], additionalSpecs: [], seo: { title: '', metaDescription: '' },
      brochure: { url: '', publicId: '' }
    }
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (nameValue && !isEditing) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      setValue('slug', generatedSlug);
    }
  }, [nameValue, isEditing, setValue]);

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'additionalSpecs' });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        categories: Array.isArray(product.categories)
          ? product.categories.map(c => typeof c === 'object' ? c._id : c)
          : [],
        tags: product.tags.map(t => typeof t === 'object' ? t._id : t),
        composition: Array.isArray(product.composition) ? product.composition.join(', ') : product.composition,
      } as any);

      if (product.strength && !STRENGTH_OPTIONS.includes(product.strength)) {
        setIsStrengthOther(true);
      }
      if (product.packaging?.type && !PACKAGING_TYPE_OPTIONS.includes(product.packaging.type)) {
        setIsPkgTypeOther(true);
      }
      if (product.packaging?.size && !PACKAGE_SIZE_OPTIONS.includes(product.packaging.size)) {
        setIsPkgSizeOther(true);
      }
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
    const cleanedData: any = { ...data };
    if (!cleanedData.brochure?.url) {
      delete cleanedData.brochure;
    }
    
    // Convert composition string back to array before submission
    if (typeof cleanedData.composition === 'string') {
      cleanedData.composition = cleanedData.composition
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s !== '');
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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Basic Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Provide the core details of the product including its name, brand, and general description.</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Controller name="name" control={control} render={({ field }) => (
                    <TextField {...field} label="Product Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Specifications</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Specify the physical and chemical properties such as strength, dosage form, and composition.</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Controller name="strength" control={control} render={({ field }) => {
                    const currentValue = field.value || '';
                    const isPredefined = STRENGTH_OPTIONS.includes(currentValue);
                    const radioValue = isStrengthOther ? 'Other' : (isPredefined ? currentValue : '');
                    return (
                      <FormControl component="fieldset" fullWidth sx={{ mb: 1 }}>
                        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Strength</FormLabel>
                        <RadioGroup
                          row
                          value={radioValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setIsStrengthOther(true);
                              field.onChange('');
                            } else {
                              setIsStrengthOther(false);
                              field.onChange(val);
                            }
                          }}
                        >
                          {STRENGTH_OPTIONS.map((opt) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                          ))}
                          <FormControlLabel value="Other" control={<Radio />} label="Other" />
                        </RadioGroup>
                        {isStrengthOther && (
                          <TextField
                            value={currentValue}
                            onChange={(e) => field.onChange(e.target.value)}
                            label="Specify Strength"
                            fullWidth
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </FormControl>
                    );
                  }}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller name="dosageForm" control={control} render={({ field }) => (
                    <TextField {...field} label="Dosage Form" fullWidth />
                  )}/>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller name="composition" control={control} render={({ field }) => (
                    <TextField 
                      {...field}
                      value={field.value || ''}
                      label="Composition (comma separated)" 
                      fullWidth 
                      helperText="Enter ingredients separated by commas"
                    />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Additional Specifications</Typography>
                <Button startIcon={<Plus size={16} />} onClick={() => appendSpec({ label: '', value: '' })}>Add Spec</Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Add any other key-value pairs that describe this product.</Typography>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Images</Typography>
                <Button startIcon={<Plus size={16} />} onClick={() => appendImage({ url: '', alt: '', isPrimary: false })}>Add Image URL</Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Upload product images or provide direct URLs.</Typography>
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
                          setValue('brochure.url' as any, response.data.data.url);
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

              <Controller name="scope" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.scope}>
                  <InputLabel>Scope</InputLabel>
                  <Select {...field} label="Scope">
                    <MenuItem value={ProductScope.DOMESTIC}>Domestic</MenuItem>
                    <MenuItem value={ProductScope.INTERNATIONAL}>International</MenuItem>
                    <MenuItem value={ProductScope.BOTH}>Both (Domestic & International)</MenuItem>
                  </Select>
                </FormControl>
              )}/>

              <Controller name="categories" control={control} render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.categories}>
                  <InputLabel>Categories</InputLabel>
                  <Select {...field} label="Categories" multiple value={Array.isArray(field.value) ? field.value : []}>
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
                <Grid size={12}>
                  <Controller name="packaging.type" control={control} render={({ field }) => {
                    const currentValue = field.value || '';
                    const isPredefined = PACKAGING_TYPE_OPTIONS.includes(currentValue);
                    const radioValue = isPkgTypeOther ? 'Other' : (isPredefined ? currentValue : '');
                    return (
                      <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Packaging Type</FormLabel>
                        <RadioGroup
                          row
                          value={radioValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setIsPkgTypeOther(true);
                              field.onChange('');
                            } else {
                              setIsPkgTypeOther(false);
                              field.onChange(val);
                            }
                          }}
                        >
                          {PACKAGING_TYPE_OPTIONS.map((opt) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                          ))}
                          <FormControlLabel value="Other" control={<Radio />} label="Other" />
                        </RadioGroup>
                        {isPkgTypeOther && (
                          <TextField
                            value={currentValue}
                            onChange={(e) => field.onChange(e.target.value)}
                            label="Specify Packaging Type"
                            fullWidth
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </FormControl>
                    );
                  }}/>
                </Grid>
                <Grid size={12}>
                  <Controller name="packaging.size" control={control} render={({ field }) => {
                    const currentValue = field.value || '';
                    const isPredefined = PACKAGE_SIZE_OPTIONS.includes(currentValue);
                    const radioValue = isPkgSizeOther ? 'Other' : (isPredefined ? currentValue : '');
                    return (
                      <FormControl component="fieldset" fullWidth sx={{ mb: 1 }}>
                        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Package Size</FormLabel>
                        <RadioGroup
                          row
                          value={radioValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setIsPkgSizeOther(true);
                              field.onChange('');
                            } else {
                              setIsPkgSizeOther(false);
                              field.onChange(val);
                            }
                          }}
                        >
                          {PACKAGE_SIZE_OPTIONS.map((opt) => (
                            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                          ))}
                          <FormControlLabel value="Other" control={<Radio />} label="Other" />
                        </RadioGroup>
                        {isPkgSizeOther && (
                          <TextField
                            value={currentValue}
                            onChange={(e) => field.onChange(e.target.value)}
                            label="Specify Package Size"
                            fullWidth
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </FormControl>
                    );
                  }}/>
                </Grid>
              </Grid>
            </Paper>

            {/* Submit Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" startIcon={<Eye size={18} />} onClick={() => setPreviewOpen(true)}>Preview</Button>
              <Button variant="outlined" onClick={() => navigate('/products')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </Box>

          </Grid>
        </Grid>
      </form>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Product Preview</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f4f7f6', display: 'flex', justifyContent: 'center', p: 4 }}>
          {/* Pharmeasy style card preview */}
          <Card sx={{ width: '100%', maxWidth: 360, borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'relative', overflow: 'visible' }}>
            <Box sx={{ position: 'absolute', top: -12, right: 16, zIndex: 10 }}>
              <Chip label={watch('productType') || 'TABLET'} sx={{ bgcolor: 'white', color: '#146C94', fontWeight: 'bold', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 1 }} />
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              {watch('images')?.[0]?.url ? (
                <img src={watch('images')![0].url} alt="Product" style={{ height: 180, objectFit: 'contain' }} />
              ) : (
                <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>No Image</Box>
              )}
            </Box>
            <CardContent sx={{ pt: 1, bgcolor: '#ffffff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
              <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 'bold', lineHeight: 1 }}>
                {watch('brandName') || 'BRAND NAME'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5, lineHeight: 1.2, mb: 1, color: '#1a1a1a' }}>
                {watch('name') || 'Product Name'}
              </Typography>
              {watch('composition') && typeof watch('composition') === 'string' && watch('composition')!.trim() !== '' && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {watch('composition')!.split(',').map(s => s.trim()).filter(s => s !== '').join(' + ')}
                </Typography>
              )}
              {watch('packaging')?.size && (
                <Chip size="small" label={watch('packaging')?.size} sx={{ bgcolor: '#f3f4f6', color: '#4b5563', borderRadius: 1 }} />
              )}
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)} variant="contained" color="primary" sx={{ borderRadius: 2 }}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductForm;
