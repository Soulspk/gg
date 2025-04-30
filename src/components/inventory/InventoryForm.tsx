import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { InventoryItem } from '../../services/db';

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const generateSKU = (category: string): string => {
  const prefix = category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${randomNum}`;
};

export const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imageUrls || []);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  
  useEffect(() => {
    const savedCategories = localStorage.getItem('db_categories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      setCategories([
        { value: '', label: 'Select category' },
        ...parsedCategories.map((cat: any) => ({
          value: cat.name.toLowerCase(),
          label: cat.name
        }))
      ]);
    }
  }, []);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<
    Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated'>
  >({
    defaultValues: initialData ? {
      name: initialData.name,
      sku: initialData.sku,
      category: initialData.category,
      quantity: initialData.quantity,
      price: initialData.price,
      cost: initialData.cost,
      imageUrls: initialData.imageUrls || [],
      description: initialData.description || '',
      supplier: initialData.supplier || '',
      reorderPoint: initialData.reorderPoint || 0,
    } : {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      price: 0,
      cost: 0,
      imageUrls: [],
      description: '',
      supplier: '',
      reorderPoint: 0,
    }
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (selectedCategory && !initialData) {
      setValue('sku', generateSKU(selectedCategory));
    }
  }, [selectedCategory, setValue, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrls(prev => [...prev, result]);
        setValue('imageUrls', [...imageUrls, result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue('imageUrls', newUrls);
  };

  const submitForm = handleSubmit((data) => {
    const formData = {
      ...data,
      imageUrls,
    };
    onSubmit(formData);
  });

  return (
    <form onSubmit={submitForm} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Product name is required' }}
                render={({ field }) => (
                  <Input
                    label="Product Name"
                    placeholder="Enter product name"
                    error={errors.name?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select
                    label="Category"
                    options={categories}
                    error={errors.category?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="sku"
                control={control}
                render={({ field }) => (
                  <Input
                    label="SKU"
                    placeholder="Auto-generated"
                    error={errors.sku?.message}
                    fullWidth
                    disabled
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity cannot be negative' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Quantity"
                      placeholder="0"
                      error={errors.quantity?.message}
                      fullWidth
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
                
                <Controller
                  name="reorderPoint"
                  control={control}
                  rules={{ 
                    min: { value: 0, message: 'Reorder point cannot be negative' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Reorder Point"
                      placeholder="0"
                      error={errors.reorderPoint?.message}
                      fullWidth
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="price"
                  control={control}
                  rules={{ 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Price (DH)"
                      placeholder="0.00"
                      error={errors.price?.message}
                      fullWidth
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
                
                <Controller
                  name="cost"
                  control={control}
                  rules={{ 
                    required: 'Cost is required',
                    min: { value: 0, message: 'Cost cannot be negative' }
                  }}
                  render={({ field }) => (
                    <Input
                      type="number"
                      label="Cost (DH)"
                      placeholder="0.00"
                      error={errors.cost?.message}
                      fullWidth
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Images and Additional Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Images</h3>
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-8 gap-2 mb-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-[40px] h-[40px] object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <X size={12} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors">
              <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center cursor-pointer">
                <Upload size={20} className="text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload images</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
            <div className="space-y-4">
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Supplier"
                    placeholder="Enter supplier name"
                    fullWidth
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full min-w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                      placeholder="Enter product description"
                      {...field}
                    ></textarea>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};