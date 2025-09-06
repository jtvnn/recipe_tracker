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
      <ListGroup>
        {filteredRecipes.map(recipe => (
          <ListGroupItem key={recipe.id} className="d-flex align-items-start gap-3">
            {recipe.imageUrl && (
              <Image
                src={recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`}
                alt={recipe.name}
                thumbnail
                style={{ width: 80, height: 80, objectFit: 'cover' }}
                className="me-2"
              />
            )}
                   <div className="flex-grow-1 d-flex align-items-start">
                     <span className="fw-bold me-2">{recipe.name}</span>
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
                     <div className="text-muted small ms-2 flex-grow-1">
                       {recipe.ingredients && recipe.ingredients.length > 60
                         ? recipe.ingredients.slice(0, 60) + '...'
                         : recipe.ingredients || ''}
                     </div>
                     <div className="d-flex flex-wrap gap-2 mt-2 ms-auto">
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
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}
