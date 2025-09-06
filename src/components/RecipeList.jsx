import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecipes, deleteRecipe, toggleFavorite } from '../redux/recipesSlice';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';

export default function RecipeList({ onEdit }) {
  const recipes = useSelector(state => state.recipes.recipes);
  const status = useSelector(state => state.recipes.status);
  const error = useSelector(state => state.recipes.error);
  const dispatch = useDispatch();

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
  return (
    <div>
      <h2 className="mb-3">Recipes</h2>
      <ListGroup>
        {recipes.map(recipe => (
          <ListGroupItem key={recipe.id} className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 d-flex align-items-center">
              <button
                className="btn btn-link p-0 me-2"
                title={recipe.favorite ? 'Unfavorite' : 'Favorite'}
                onClick={() => dispatch(toggleFavorite(recipe.id))}
                style={{ fontSize: '1.3em', color: recipe.favorite ? '#ffc107' : '#bbb' }}
                aria-label={recipe.favorite ? 'Unfavorite' : 'Favorite'}
              >
                {recipe.favorite ? '★' : '☆'}
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
