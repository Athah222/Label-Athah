
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  categories: string[];
  maxPrice: number;
  currentFilters: {
    categories: string[];
    priceRange: [number, number];
    sort: string;
  };
  onFilterChange: (newFilters: { categories?: string[]; priceRange?: [number, number]; sort?: string; }) => void;
}

export function ProductFilters({ categories, maxPrice, onFilterChange, currentFilters }: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(currentFilters.priceRange);

  useEffect(() => {
    // Sync local price range when maxPrice from props changes
    setLocalPriceRange([currentFilters.priceRange[0], maxPrice]);
  }, [maxPrice, currentFilters.priceRange[0]]);

  useEffect(() => {
    // Or when the filter from parent changes
    setLocalPriceRange(currentFilters.priceRange);
  }, [currentFilters.priceRange])

  const handleCategoryChange = (category: string, checked: boolean | 'indeterminate') => {
    const newCategories = checked
      ? [...currentFilters.categories, category]
      : currentFilters.categories.filter(c => c !== category);
    onFilterChange({ categories: newCategories });
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Sort By</h3>
           <Select defaultValue={currentFilters.sort} onValueChange={(value) => onFilterChange({ sort: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sort products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={currentFilters.categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                />
                <Label htmlFor={`cat-${category}`} className="font-normal capitalize">{category}</Label>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold mb-3">Price Range</h3>
          <Slider
            min={0}
            max={maxPrice}
            step={100}
            value={localPriceRange}
            onValueChange={setLocalPriceRange}
            onValueCommit={(value) => onFilterChange({ priceRange: value as [number, number] })}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{formatPrice(localPriceRange[0])}</span>
            <span>{formatPrice(localPriceRange[1])}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
