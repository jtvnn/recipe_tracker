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
      className={`border rounded-lg p-2 mb-2 bg-white dark:bg-gray-800 shadow-sm font-medium text-gray-800 dark:text-gray-100 cursor-grab transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <span>{recipe.name}</span>
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
      className={`border rounded-lg p-3 mb-2 min-h-[60px] bg-gray-50 dark:bg-gray-800 transition-colors ${isOver && canDrop ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'}`}
    >
      <span className="font-semibold text-gray-700 dark:text-gray-100">{day}</span>
      <div className="mt-2">
        {assigned.length > 0 ? (
          assigned.map((rec, idx) => (
            <span key={rec.id} className="inline-flex items-center bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100 rounded px-2 py-1 text-xs font-medium mr-1 mb-1">
              {rec.name}
              <button
                type="button"
                className="ml-2 text-xs text-green-900 dark:text-green-100 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
                aria-label="Remove"
                onClick={() => onRemove(day, rec.id)}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs">Drop a recipe here</span>
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
    return <div className="text-center my-4 text-gray-500 dark:text-gray-300">Loading meal planner...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="meal-planner bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="mb-5 text-xl font-bold text-gray-800 dark:text-gray-100">Meal Planner <span className="font-normal text-base">(Drag & Drop)</span></h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3 border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-700 dark:text-gray-100">Recipes</span>
              {recipes.length === 0 && <div className="text-gray-400 text-xs mt-2">No recipes</div>}
              {recipes.map(r => <RecipeDraggable key={r.id} recipe={r} />)}
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {daysOfWeek.map(day => (
                <DayDropZone
                  key={day}
                  day={day}
                  assignedRecipes={filteredPlan[day]}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  recipes={recipes}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
