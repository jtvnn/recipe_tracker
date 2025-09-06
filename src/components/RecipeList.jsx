import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecipes, deleteRecipe, toggleFavorite } from '../redux/recipesSlice';
import { Button } from 'reactstrap';
import { Image } from 'react-bootstrap';


function getShareUrl(recipeId) {
  // Use current location as base, fallback to window.location if available
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/share/${recipeId}`;
}

async function handleShare(recipe) {
  const url = getShareUrl(recipe.id);
  const text = `Check out this recipe: ${recipe.name}\n${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: recipe.name, text, url });
      return;
    } catch {}
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  } catch {
    window.prompt('Copy this link:', url);
  }
}

export default function RecipeList({ onEdit }) {
  const recipes = useSelector(state => state.recipes.recipes);
  const status = useSelector(state => state.recipes.status);
  const error = useSelector(state => state.recipes.error);
  const dispatch = useDispatch();
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getRecipes());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div className="text-center my-4">Loading recipes...</div>;
  }
  if (status === 'failed') {
    return <div className="text-danger my-4">Error: {error}</div>;
  }
  // Ensure all recipes have a boolean favorite property
  const normalizedRecipes = recipes.map(r => ({ ...r, favorite: !!r.favorite }));
  const filteredRecipes = showFavorites ? normalizedRecipes.filter(r => r.favorite) : normalizedRecipes;
  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Recipes</h2>
        <button
          className={`rounded-full px-5 py-1.5 text-sm font-medium border transition-colors ${showFavorites ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
          onClick={() => setShowFavorites(f => !f)}
        >
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl flex flex-col h-full min-h-[220px] p-0">
            <div className="flex items-center px-4 pt-4 pb-0">
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`}
                  alt={recipe.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 bg-gray-50 mr-4"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 mr-4 flex items-center justify-center text-gray-300 text-2xl">
                  <span role="img" aria-label="No image">🍽️</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-lg text-gray-900 dark:text-gray-100 mr-2">{recipe.name}</span>
                  <button
                    className="ml-auto text-2xl focus:outline-none transition-colors"
                    style={{ color: recipe.favorite ? '#fbbf24' : '#cbd5e1' }}
                    onClick={() => dispatch(toggleFavorite(recipe.id))}
                    aria-label={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                    title={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                  >
                    {recipe.favorite ? '★' : '☆'}
                  </button>
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm min-h-[32px]">
                  {recipe.ingredients && recipe.ingredients.length > 60
                    ? recipe.ingredients.slice(0, 60) + '...'
                    : recipe.ingredients || ''}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 px-4 pb-4 pt-2 mt-auto">
              <button
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-1 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onEdit(recipe)}
              >
                Edit
              </button>
              <button
                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-1 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                onClick={() => handleShare(recipe)}
              >
                <span role="img" aria-label="Share" className="mr-1">📤</span>
                Share
              </button>
              <button
                className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg px-4 py-1 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                onClick={() => dispatch(deleteRecipe(recipe.id))}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
