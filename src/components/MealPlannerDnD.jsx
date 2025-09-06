import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
  // plan: { [day]: [recipeId, ...] }
  const [plan, setPlan] = useState({});

  const handleDrop = (day, recipeId) => {
    setPlan(prev => {
      const prevList = prev[day] || [];
      if (prevList.includes(recipeId)) return prev; // Prevent duplicates
      return { ...prev, [day]: [...prevList, recipeId] };
    });
  };

  const handleRemove = (day, recipeId) => {
    setPlan(prev => {
      const prevList = prev[day] || [];
      return { ...prev, [day]: prevList.filter(id => id !== recipeId) };
    });
  };

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
                    assignedRecipes={plan[day]}
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
