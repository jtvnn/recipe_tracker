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

  // Magazine style: first recipe is featured, rest in grid
  const featured = filteredRecipes[0];
  const rest = filteredRecipes.slice(1);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="magazine-title text-uppercase fw-bold mb-0" style={{ letterSpacing: 2 }}>My Recipes</h2>
        <button
          className={`btn btn-sm ${showFavorites ? 'btn-warning' : 'btn-outline-primary'}`}
          onClick={() => setShowFavorites(f => !f)}
        >
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>
      </div>
      {featured && (
        <div className="card mb-4 shadow magazine-featured-card position-relative overflow-hidden" style={{ minHeight: 220 }}>
          {featured.imageUrl && (
            <Image
              src={featured.imageUrl.startsWith('http') ? featured.imageUrl : `/uploads/${featured.imageUrl}`}
              alt={featured.name}
              style={{ width: '100%', height: 220, objectFit: 'cover', filter: 'brightness(0.85)' }}
            />
          )}
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.1) 60%,rgba(0,0,0,0.7) 100%)' }}>
            <h3 className="text-white fw-bold" style={{ fontSize: '2rem', textShadow: '0 2px 8px #000' }}>{featured.name}</h3>
            <div className="mb-2" style={{ color: '#fff', fontSize: '1.1rem', textShadow: '0 1px 4px #000' }}>
              {featured.ingredients && featured.ingredients.length > 80
                ? featured.ingredients.slice(0, 80) + '...'
                : featured.ingredients || ''}
            </div>
            <div className="d-flex gap-2">
              <Button color="secondary" size="sm" onClick={() => onEdit(featured)}>Edit</Button>
              <Button color="info" size="sm" onClick={() => handleShare(featured)}><span role="img" aria-label="Share">📤</span> Share</Button>
              <Button color="danger" size="sm" onClick={() => dispatch(deleteRecipe(featured.id))}>Delete</Button>
              <Button color={featured.favorite ? 'warning' : 'outline-light'} size="sm" onClick={() => dispatch(toggleFavorite(featured.id))}>{featured.favorite ? '★' : '☆'}</Button>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex flex-column gap-3">
        {rest.map(recipe => (
          <div className="card shadow-sm magazine-recipe-card position-relative overflow-hidden" key={recipe.id}>
            {recipe.imageUrl && (
              <Image
                src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`}
                alt={recipe.name}
                style={{ width: '100%', height: 120, objectFit: 'cover', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
              />
            )}
            <div className="card-body d-flex flex-column p-3">
              <h5 className="fw-bold mb-2 text-truncate magazine-recipe-title">{recipe.name}</h5>
              <div className="small mb-2 magazine-recipe-ingredients" style={{ color: '#fff', textShadow: '0 1px 4px #000' }}>
                {recipe.ingredients && recipe.ingredients.length > 60
                  ? recipe.ingredients.slice(0, 60) + '...'
                  : recipe.ingredients || ''}
              </div>
              <div className="d-flex gap-2 mt-auto">
                <Button color="secondary" size="sm" onClick={() => onEdit(recipe)}>Edit</Button>
                <Button color="info" size="sm" onClick={() => handleShare(recipe)}><span role="img" aria-label="Share">📤</span></Button>
                <Button color="danger" size="sm" onClick={() => dispatch(deleteRecipe(recipe.id))}>Delete</Button>
                <Button color={recipe.favorite ? 'warning' : 'outline-secondary'} size="sm" onClick={() => dispatch(toggleFavorite(recipe.id))}>{recipe.favorite ? '★' : '☆'}</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
