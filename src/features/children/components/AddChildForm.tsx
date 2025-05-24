import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MultiSelect } from '../../../components/ui/MultiSelect';

const readingInterests = [
  { value: 'fantasy', label: '🧙‍♂️ Fantasy' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'tech', label: '💻 Technology' },
  { value: 'science', label: '🔬 Science' },
  { value: 'history', label: '📚 History' },
  { value: 'adventure', label: '🗺️ Adventure' },
  { value: 'mystery', label: '🔍 Mystery' },
  { value: 'animals', label: '🐾 Animals & Nature' },
  { value: 'art', label: '🎨 Arts & Crafts' },
  { value: 'space', label: '🚀 Space & Astronomy' }
];

const rewardPreferences = [
  { value: 'ice_cream', label: '🍦 Ice Cream' },
  { value: 'sports_activity', label: '⚽ Sports Activity' },
  { value: 'movie_time', label: '🎬 Movie Time' },
  { value: 'gaming_time', label: '🎮 Gaming Time' },
  { value: 'gadget_time', label: '📱 Screen Time' },
  { value: 'toy', label: '🎯 New Toy' },
  { value: 'book', label: '📚 New Book' },
  { value: 'park', label: '🌳 Park Visit' },
  { value: 'pizza', label: '🍕 Pizza Party' },
  { value: 'craft_supplies', label: '✂️ Craft Supplies' }
];

const childSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  age: z.number()
    .min(4, 'Age must be at least 4')
    .max(16, 'Age must be less than 16'),
  readingInterests: z.array(z.string())
    .min(1, 'Please select at least one reading interest')
    .max(5, 'Maximum 5 interests can be selected'),
  rewardPreferences: z.array(z.string())
    .min(1, 'Please select at least one reward preference')
    .max(5, 'Maximum 5 reward preferences can be selected')
});

type ChildFormData = z.infer<typeof childSchema>;

interface AddChildFormProps {
  onSubmit: (data: ChildFormData) => void;
  isLoading?: boolean;
}

export function AddChildForm({ onSubmit, isLoading = false }: AddChildFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      readingInterests: [],
      rewardPreferences: []
    }
  });

  const handleFormSubmit = (data: ChildFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Child's Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Enter child's name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Age
          </label>
          <input
            {...register('age', { valueAsNumber: true })}
            type="number"
            id="age"
            min="4"
            max="16"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reading Interests
          </label>
          <Controller
            name="readingInterests"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={readingInterests}
                value={readingInterests.filter(option => 
                  field.value.includes(option.value)
                )}
                onChange={(selected) => {
                  field.onChange(selected.map(option => option.value));
                }}
                placeholder="Select interests (max 5)"
                isMulti
                maxItems={5}
              />
            )}
          />
          {errors.readingInterests && (
            <p className="mt-1 text-sm text-red-600">{errors.readingInterests.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Preferences
          </label>
          <Controller
            name="rewardPreferences"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={rewardPreferences}
                value={rewardPreferences.filter(option => 
                  field.value.includes(option.value)
                )}
                onChange={(selected) => {
                  field.onChange(selected.map(option => option.value));
                }}
                placeholder="Select rewards (max 5)"
                isMulti
                maxItems={5}
              />
            )}
          />
          {errors.rewardPreferences && (
            <p className="mt-1 text-sm text-red-600">{errors.rewardPreferences.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-4 py-2"
        >
          {isLoading ? 'Adding Child...' : 'Add Child'}
        </button>
      </div>
    </form>
  );
} 