import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecipes, deleteRecipe, toggleFavorite } from '../redux/recipesSlice';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';


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
          <ListGroupItem key={recipe.id} className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 d-flex align-items-center">
              <button
                className="favorite-star-btn me-2"
                title={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                onClick={() => dispatch(toggleFavorite(recipe.id))}
                aria-label={recipe.favorite ? 'Unfavorite' : 'Favorite'}
              >
                <span
                  style={{
                    fontSize: '1.7em',
                    color: recipe.favorite ? '#ffc107' : '#bbb',
                    transition: 'color 0.2s, transform 0.1s',
                    verticalAlign: 'middle',
                    textShadow: recipe.favorite ? '0 2px 8px #ffe066' : 'none',
                  }}
                >
                  {recipe.favorite ? '★' : '☆'}
                </span>
              </button>
              <span className="fw-bold">{recipe.name}</span>
              <div className="text-muted small ms-2">
                {recipe.ingredients
                  ? recipe.ingredients.length > 60
                    ? recipe.ingredients.slice(0, 60) + '...'
                    : recipe.ingredients
                  : ''}
              </div>
            </div>
            <div>
              <Button color="secondary" size="sm" className="me-2" onClick={() => onEdit(recipe)}>
                Edit
              </Button>
              <Button color="danger" size="sm" onClick={() => dispatch(deleteRecipe(recipe.id))}>
                Delete
              </Button>
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}
