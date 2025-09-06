import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecipes, deleteRecipe, toggleFavorite } from '../redux/recipesSlice';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Recipes</h2>
        <button
          className={`btn btn-sm ${showFavorites ? 'btn-warning' : 'btn-outline-secondary'}`}
          onClick={() => setShowFavorites(f => !f)}
        >
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>
      </div>
      <div className="row g-3">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column p-3">
                <div className="d-flex align-items-center mb-2">
                  {recipe.imageUrl ? (
                    <Image
                      src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`}
                      alt={recipe.name}
                      rounded
                      style={{ width: 64, height: 64, objectFit: 'cover', marginRight: 16, border: '1px solid #eee' }}
                    />
                  ) : (
                    <div style={{ width: 64, height: 64, background: '#f8f9fa', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 32 }}>
                      🍽️
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <span className="fw-bold fs-5 me-2">{recipe.name}</span>
                      <Button
                        color="link"
                        size="sm"
                        className="p-0 m-0 align-self-center"
                        style={{ color: recipe.favorite ? '#FFD700' : '#bbb', fontSize: '1.5em', textDecoration: 'none' }}
                        onClick={() => dispatch(toggleFavorite(recipe.id))}
                        aria-label={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                        title={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                      >
                        {recipe.favorite ? '★' : '☆'}
                      </Button>
                    </div>
                    <div className="text-muted small mt-1" style={{ minHeight: 32 }}>
                      {recipe.ingredients && recipe.ingredients.length > 60
                        ? recipe.ingredients.slice(0, 60) + '...'
                        : recipe.ingredients || ''}
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-auto pt-2">
                  <Button color="secondary" size="sm" className="me-2" onClick={() => onEdit(recipe)}>
                    Edit
                  </Button>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShare(recipe)}
                  >
                    <span role="img" aria-label="Share" style={{ fontSize: '1.1em', marginRight: '0.4em' }}>📤</span>
                    Share
                  </Button>
                  <Button color="danger" size="sm" onClick={() => dispatch(deleteRecipe(recipe.id))}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
