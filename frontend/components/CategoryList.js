import React from 'react';

const CategoryList = ({
  categories,
  onCategoryClick,
  onCategoryDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCategoryClick(category)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Created: {new Date(category.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;