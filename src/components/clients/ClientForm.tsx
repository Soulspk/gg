import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { ClientData } from '../../services/db';

interface ClientFormProps {
  initialData?: ClientData;
  onSubmit: (data: Omit<ClientData, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<
    Omit<ClientData, 'id' | 'createdAt'>
  >({
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email || '',
      phone: initialData.phone || '',
      address: initialData.address || '',
      notes: initialData.notes || '',
      blacklisted: initialData.blacklisted || false,
      blacklistReason: initialData.blacklistReason || '',
      flagged: initialData.flagged || false,
      flagReason: initialData.flagReason || '',
    } : {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      blacklisted: false,
      blacklistReason: '',
      flagged: false,
      flagReason: '',
    }
  });

  const isBlacklisted = watch('blacklisted');
  const isFlagged = watch('flagged');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <Input
                    label="Name"
                    placeholder="Enter client name"
                    error={errors.name?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    error={errors.email?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    error={errors.phone?.message}
                    fullWidth
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
            <div className="space-y-4">
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      className="w-full min-w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Enter client address"
                      {...field}
                    ></textarea>
                  </div>
                )}
              />
              
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="w-full min-w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Enter any additional notes"
                      {...field}
                    ></textarea>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Status Information */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Client Status</h3>
            <div className="space-y-6">
              {/* Blacklist Section */}
              <div className="space-y-4">
                <Controller
                  name="blacklisted"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Checkbox
                      label="Blacklist this client"
                      description="Mark this client as blacklisted and provide a reason"
                      checked={value}
                      onChange={onChange}
                    />
                  )}
                />
                
                {isBlacklisted && (
                  <Controller
                    name="blacklistReason"
                    control={control}
                    rules={{ required: 'Blacklist reason is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Blacklist Reason
                        </label>
                        <textarea
                          className="w-full min-w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={4}
                          placeholder="Enter the reason for blacklisting this client"
                          {...field}
                        ></textarea>
                        {errors.blacklistReason && (
                          <p className="mt-1 text-sm text-red-600">{errors.blacklistReason.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>

              {/* Flag Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <Controller
                  name="flagged"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Checkbox
                      label="Flag this client"
                      description="Mark this client as flagged for special attention"
                      checked={value}
                      onChange={onChange}
                    />
                  )}
                />
                
                {isFlagged && (
                  <Controller
                    name="flagReason"
                    control={control}
                    rules={{ required: 'Flag reason is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Flag Reason
                        </label>
                        <textarea
                          className="w-full min-w-[300px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          rows={4}
                          placeholder="Enter the reason for flagging this client"
                          {...field}
                        ></textarea>
                        {errors.flagReason && (
                          <p className="mt-1 text-sm text-red-600">{errors.flagReason.message}</p>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  );
};