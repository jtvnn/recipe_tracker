import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMealPlan, setMealPlan } from '../redux/mealPlanSlice';
import { getRecipes } from '../redux/recipesSlice';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function RecipeDraggable({ recipe }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'RECIPE',
    item: { id: recipe.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [recipe.id]);

  return (
    <div
      ref={drag}
      className="border rounded p-2 mb-2 bg-white shadow-sm"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}
    >
      <strong>{recipe.name}</strong>
    </div>
  );
}

function DayDropZone({ day, assignedRecipes, onDrop, onRemove, recipes }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'RECIPE',
    drop: (item) => onDrop(day, item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [day, onDrop]);

  const assigned = (assignedRecipes || []).map(id => recipes.find(r => r.id == id)).filter(Boolean);

  return (
    <div
      ref={drop}
      className={`border rounded p-2 mb-2 bg-light ${isOver && canDrop ? 'border-primary bg-info bg-opacity-25' : ''}`}
      style={{ minHeight: 60 }}
    >
      <strong>{day}</strong>
      <div className="mt-2">
        {assigned.length > 0 ? (
          assigned.map((rec, idx) => (
            <span key={rec.id} className="badge bg-success me-1 mb-1 d-inline-flex align-items-center">
              {rec.name}
              <button
                type="button"
                className="btn-close btn-close-white btn-sm ms-2"
                aria-label="Remove"
                style={{ filter: 'invert(1)', opacity: 0.7, fontSize: '0.7em' }}
                onClick={() => onRemove(day, rec.id)}
              />
            </span>
          ))
        ) : (
          <span className="text-muted small">Drop a recipe here</span>
        )}
      </div>
    </div>
  );
}

export default function MealPlannerDnD() {
  const recipes = useSelector(state => state.recipes.recipes);
  const recipesStatus = useSelector(state => state.recipes.status);
  const reduxPlan = useSelector(state => state.mealPlan.plan);
  const mealPlanStatus = useSelector(state => state.mealPlan.status);
  const dispatch = useDispatch();
  const [plan, setPlan] = useState({});

  // Load recipes and meal plan on mount
  useEffect(() => {
    if (recipesStatus === 'idle') dispatch(getRecipes());
    dispatch(getMealPlan());
  }, [dispatch, recipesStatus]);

  // When reduxPlan changes (from backend), update local state and localStorage
  useEffect(() => {
    if (reduxPlan !== undefined) {
      setPlan(reduxPlan);
      localStorage.setItem('mealPlan', JSON.stringify(reduxPlan));
    }
  }, [reduxPlan]);

  // Only show assignments for recipes that exist
  const filteredPlan = {};
  for (const day in plan) {
    filteredPlan[day] = (plan[day] || []).filter(id => recipes.some(r => r.id === id));
  }

  const persistPlan = (newPlan) => {
    setPlan(newPlan);
    localStorage.setItem('mealPlan', JSON.stringify(newPlan));
    dispatch(setMealPlan(newPlan));
  };

  const handleDrop = (day, recipeId) => {
    const prevList = plan[day] || [];
    if (prevList.includes(recipeId)) return;
    const newPlan = { ...plan, [day]: [...prevList, recipeId] };
    persistPlan(newPlan);
  };

  const handleRemove = (day, recipeId) => {
    const prevList = plan[day] || [];
    const newPlan = { ...plan, [day]: prevList.filter(id => id !== recipeId) };
    persistPlan(newPlan);
  };

  // Wait for both recipes and meal plan to load
  if (recipesStatus !== 'succeeded' || mealPlanStatus === 'loading') {
    return <div className="text-center my-4">Loading meal planner...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="meal-planner card p-3 mb-4">
        <h3 className="mb-3">Meal Planner (Drag & Drop)</h3>
        <div className="row g-2">
          <div className="col-12 col-md-4">
            <div className="bg-light p-2 rounded mb-3">
              <strong>Recipes</strong>
              {recipes.length === 0 && <div className="text-muted small">No recipes</div>}
              {recipes.map(r => <RecipeDraggable key={r.id} recipe={r} />)}
            </div>
          </div>
          <div className="col-12 col-md-8">
            <div className="row g-2">
              {daysOfWeek.map(day => (
                <div className="col-12 col-lg-6" key={day}>
                  <DayDropZone
                    day={day}
                    assignedRecipes={filteredPlan[day]}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    recipes={recipes}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
