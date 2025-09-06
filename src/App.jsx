import { useState } from 'react';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import MealPlannerDnD from './components/MealPlannerDnD';
import AuthForm from './components/AuthForm';
import SpoonacularSearch from './components/SpoonacularSearch';
import { Button } from 'reactstrap';
import { login, register } from './redux/authAPI';
import { useDispatch } from 'react-redux';
import { clearRecipes } from './redux/recipesSlice';
import { addRecipe, getRecipes } from './redux/recipesSlice';
import { fetchSpoonacularRecipeDetails } from './redux/spoonacularAPI';
import './App.css';


function App() {
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const dispatch = useDispatch();

  const handleEdit = (recipe) => setEditingRecipe(recipe);
  const handleSave = () => setEditingRecipe(null);

  // Real auth handler
  const handleAuth = async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = showRegister ? await register({ email, password }) : await login({ email, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        setIsAuthenticated(true);
        dispatch(clearRecipes()); // Clear recipes on new login/register
      } else {
        setAuthError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Server error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container container py-4">
        <h1 className="mb-4 text-primary fw-bold">Recipe Tracker</h1>
        <AuthForm onAuth={handleAuth} error={authError} isRegister={showRegister} />
        <Button color="link" onClick={() => setShowRegister(r => !r)}>
          {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setEditingRecipe(null);
    dispatch(clearRecipes()); // Clear recipes on logout
  };

  // Import handler: add a Spoonacular recipe to user's list
  const handleImport = async (recipe) => {
    try {
      // Always fetch full details to get ingredients and instructions
      const details = await fetchSpoonacularRecipeDetails(recipe.id);
      const imported = {
        name: details.title,
        ingredients: details.extendedIngredients?.map(i => i.original).join(', ') || '',
        instructions: details.instructions || '',
      };
      await dispatch(addRecipe(imported)).unwrap();
      dispatch(getRecipes()); // Refresh the recipe list
    } catch (e) {
      alert('Failed to import recipe.');
    }
  };

  return (
    <div className="app-container container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bold">Recipe Tracker</h1>
        <Button color="danger" onClick={handleLogout}>Logout</Button>
      </div>
      <div className="row g-3 flex-lg-nowrap">
        {/* Sidebar: Recipe List */}
        <aside className="col-12 col-lg-4 mb-3 mb-lg-0">
          <section className="sidebar-section sidebar bg-white rounded shadow-sm p-3 h-100">
            <RecipeList onEdit={handleEdit} />
          </section>
        </aside>
        {/* Main content: Meal Planner, Form and Search */}
        <div className="col-12 col-lg-8">
          <MealPlannerDnD />
          <SpoonacularSearch onImport={handleImport} />
          <RecipeForm editingRecipe={editingRecipe} onSave={handleSave} />
        </div>
      </div>
      <footer className="app-footer mt-5 text-center text-muted small">
        &copy; {new Date().getFullYear()} Recipe Tracker by jtvnn
      </footer>
    </div>
  );
}

export default App;
