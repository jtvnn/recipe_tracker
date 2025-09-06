import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealPlanner({ onAssign }) {
  const recipes = useSelector(state => state.recipes.recipes);
  const [plan, setPlan] = useState({});

  const handleAssign = (day, recipeId) => {
    setPlan(prev => ({ ...prev, [day]: recipeId }));
    if (onAssign) onAssign(day, recipeId);
  };

  return (
    <div className="meal-planner card p-3 mb-4">
      <h3 className="mb-3">Meal Planner</h3>
      <div className="row g-2">
        {daysOfWeek.map(day => (
          <div className="col-12 col-md-6 col-lg-3" key={day}>
            <div className="border rounded p-2 mb-2 bg-light">
              <strong>{day}</strong>
              <select
                className="form-select mt-2"
                value={plan[day] || ''}
                onChange={e => handleAssign(day, e.target.value)}
              >
                <option value="">-- Select Recipe --</option>
                {recipes.map(r => (
                  <option value={r.id} key={r.id}>{r.name}</option>
                ))}
              </select>
              {plan[day] && (
                <div className="mt-2 small text-success">
                  Planned: {recipes.find(r => r.id == plan[day])?.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
