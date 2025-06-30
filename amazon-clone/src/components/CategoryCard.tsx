'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/types';
import { ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  const [imageError, setImageError] = useState(false);

  const formatProductCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Link href={`/category/${category.slug}`} className="block h-full">
      <Card className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg border-0 shadow-sm h-full',
        className
      )}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100">
            {category.image && !imageError ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Category Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
              <p className="text-sm text-gray-200">
                {formatProductCount(category.productCount)} products
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {category.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            {/* Subcategories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Popular in {category.name}:</h4>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Shop Button */}
            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors"
              >
                Shop {category.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
