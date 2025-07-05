import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CategoryList from '../../components/CategoryList';
import CategoryModal from '../../components/CategoryModal';

export default function Categories({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCategorySave = async (categoryData) => {
    setLoading(true);
    try {
      if (selectedCategory) {
        const response = await fetch(`/api/categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        });

        if (response.ok) {
          const updatedCategory = await response.json();
          setCategories(categories.map(c => c.id === selectedCategory.id ? updatedCategory : c));
        }
      } else {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        });

        if (response.ok) {
          const newCategory = await response.json();
          setCategories([...categories, newCategory]);
        }
      }
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId));
        setIsModalOpen(false);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Categories - Task Management App</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  ← Back to Tasks
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              </div>
              <button
                onClick={handleNewCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Category
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CategoryList
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onCategoryDelete={handleCategoryDelete}
            loading={loading}
          />
        </main>

        {isModalOpen && (
          <CategoryModal
            category={selectedCategory}
            onSave={handleCategorySave}
            onDelete={handleCategoryDelete}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
            }}
            loading={loading}
          />
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch('http://localhost:3001/api/categories');
    const categories = response.ok ? await response.json() : [];

    return {
      props: {
        initialCategories: categories
      }
    };
  } catch (error) {
    return {
      props: {
        initialCategories: []
      }
    };
  }
}