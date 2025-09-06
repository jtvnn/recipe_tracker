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
    <div style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold" style={{ letterSpacing: '-1px', color: '#1a202c' }}>Recipes</h2>
        <button
          className={`btn btn-sm ${showFavorites ? 'btn-primary' : 'btn-outline-primary'}`}
          style={{ borderRadius: 20, fontWeight: 500, padding: '6px 18px' }}
          onClick={() => setShowFavorites(f => !f)}
        >
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>
      </div>
      <div className="row g-4">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="col-12 col-md-6 col-lg-4">
            <div className="shadow rounded-4 border-0 bg-white h-100 d-flex flex-column justify-content-between" style={{ minHeight: 220, padding: 0 }}>
              <div className="d-flex align-items-center p-3 pb-0">
                {recipe.imageUrl ? (
                  <Image
                    src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`}
                    alt={recipe.name}
                    roundedCircle
                    style={{ width: 56, height: 56, objectFit: 'cover', marginRight: 18, border: '2px solid #e2e8f0', background: '#f8fafc' }}
                  />
                ) : (
                  <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', marginRight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 28, border: '2px solid #e2e8f0' }}>
                    <span role="img" aria-label="No image">🍽️</span>
                  </div>
                )}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-semibold fs-5 me-2" style={{ color: '#222' }}>{recipe.name}</span>
                    <Button
                      color="link"
                      size="sm"
                      className="p-0 m-0 align-self-center"
                      style={{ color: recipe.favorite ? '#fbbf24' : '#cbd5e1', fontSize: '1.5em', textDecoration: 'none', transition: 'color 0.2s' }}
                      onClick={() => dispatch(toggleFavorite(recipe.id))}
                      aria-label={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                      title={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                    >
                      {recipe.favorite ? '★' : '☆'}
                    </Button>
                  </div>
                  <div className="text-muted small" style={{ minHeight: 32, fontSize: 15 }}>
                    {recipe.ingredients && recipe.ingredients.length > 60
                      ? recipe.ingredients.slice(0, 60) + '...'
                      : recipe.ingredients || ''}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 px-3 pb-3 pt-2 mt-auto">
                <Button color="secondary" size="sm" className="me-2 px-3" style={{ borderRadius: 16, fontWeight: 500 }} onClick={() => onEdit(recipe)}>
                  Edit
                </Button>
                <Button
                  color="info"
                  size="sm"
                  className="me-2 px-3"
                  style={{ borderRadius: 16, fontWeight: 500 }}
                  onClick={() => handleShare(recipe)}
                >
                  <span role="img" aria-label="Share" style={{ fontSize: '1.1em', marginRight: '0.4em' }}>📤</span>
                  Share
                </Button>
                <Button color="danger" size="sm" className="px-3" style={{ borderRadius: 16, fontWeight: 500 }} onClick={() => dispatch(deleteRecipe(recipe.id))}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
