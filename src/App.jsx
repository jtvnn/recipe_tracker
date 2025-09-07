import { useState } from 'react';
import RecipeList from './components/RecipeList';
import RecipeModal from './components/RecipeModal';
import MealPlannerDnD from './components/MealPlannerDnD';
import AuthForm from './components/AuthForm';
import SpoonacularSearch from './components/SpoonacularSearch';
import { Button } from 'reactstrap';
import { login, register } from './redux/authAPI';
import { useDispatch } from 'react-redux';
import { clearRecipes } from './redux/recipesSlice';
import { addRecipe, editRecipe, getRecipes } from './redux/recipesSlice';
import { fetchSpoonacularRecipeDetails } from './redux/spoonacularAPI';
import './App.css';


function App() {
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const dispatch = useDispatch();

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowRecipeModal(true);
  };
  const handleAdd = () => {
    setEditingRecipe(null);
    setShowRecipeModal(true);
  };
  const handleSave = async (form) => {
    if (editingRecipe && editingRecipe.id) {
      await dispatch(
        editRecipe({ id: editingRecipe.id, updatedRecipe: { ...editingRecipe, ...form, id: editingRecipe.id } })
      ).unwrap();
    } else {
      await dispatch(
        addRecipe(form)
      ).unwrap();
    }
    setEditingRecipe(null);
    setShowRecipeModal(false);
    dispatch(getRecipes());
  };
  const handleCloseModal = () => {
    setEditingRecipe(null);
    setShowRecipeModal(false);
  };

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
    } catch {
      setAuthError('Server error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`app-container container-xl py-4${darkTheme ? ' dark-theme' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0 text-primary fw-bold">Recipe Tracker</h1>
          <Button color={darkTheme ? 'secondary' : 'dark'} outline onClick={() => setDarkTheme(t => !t)}>
            {darkTheme ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
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
    setAuthError(null);
    setShowRegister(false);
    dispatch(clearRecipes()); // Clear recipes on logout
    // Optionally force a reload to reset all state
    // window.location.reload();
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
    } catch {
      alert('Failed to import recipe.');
    }
  };

  return (
    <div className={`app-container container-xl py-4${darkTheme ? ' dark-theme' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bold mb-0">Recipe Tracker</h1>
        <div className="d-flex gap-2">
          <Button color={darkTheme ? 'secondary' : 'dark'} outline onClick={() => setDarkTheme(t => !t)}>
            {darkTheme ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button color="danger" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <div className="row g-3 flex-lg-nowrap">
        <aside className="col-12 col-lg-4 mb-3 mb-lg-0">
          <section className="sidebar-section sidebar bg-white rounded shadow-sm p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">My Recipes</span>
              <Button color="primary" size="sm" onClick={handleAdd}>Add Recipe</Button>
            </div>
            <RecipeList onEdit={handleEdit} />
          </section>
        </aside>
        <div className="col-12 col-lg-8">
          <MealPlannerDnD />
          <SpoonacularSearch onImport={handleImport} />
        </div>
      </div>
      <RecipeModal
        show={showRecipeModal}
        handleClose={handleCloseModal}
        handleSave={handleSave}
        initialData={editingRecipe}
      />
      <footer className="app-footer mt-5 text-center text-muted small">
        &copy; {new Date().getFullYear()} Recipe Tracker by jtvnn
      </footer>
    </div>
  );
}

export default App;
