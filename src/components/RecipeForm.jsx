import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addRecipe, editRecipe } from '../redux/recipesSlice';
import { Form, FormGroup, Label, Input, Button, Card, CardBody } from 'reactstrap';

export default function RecipeForm({ editingRecipe, onSave }) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name);
      setIngredients(editingRecipe.ingredients);
    } else {
      setName('');
      setIngredients('');
    }
  }, [editingRecipe]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingRecipe) {
      await dispatch(editRecipe({ id: editingRecipe.id, updatedRecipe: { ...editingRecipe, name, ingredients } }));
    } else {
      await dispatch(addRecipe({ name, ingredients }));
    }
    onSave();
    setName('');
    setIngredients('');
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <h2 className="mb-3">{editingRecipe ? 'Edit Recipe' : 'Add Recipe'}</h2>
          <FormGroup>
            <Label for="recipeName">Recipe Name</Label>
            <Input
              id="recipeName"
              type="text"
              placeholder="Recipe Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="ingredients">Ingredients</Label>
            <Input
              id="ingredients"
              type="textarea"
              placeholder="Ingredients"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" type="submit">
            {editingRecipe ? 'Update' : 'Add'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
