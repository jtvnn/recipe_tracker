import { useState } from 'react';
import { searchSpoonacularRecipes } from '../redux/spoonacularAPI';
import { Button, Input, Spinner, Card, CardBody, CardTitle, CardText } from 'reactstrap';

export default function SpoonacularSearch({ onImport }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const recipes = await searchSpoonacularRecipes(query);
      setResults(recipes);
    } catch (err) {
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search Spoonacular recipes..."
        />
        <Button color="primary" type="submit" disabled={loading || !query}>Search</Button>
      </form>
      {loading && <Spinner size="sm" />}
      {error && <div className="text-danger mb-2">{error}</div>}
      <div className="d-flex flex-wrap gap-3">
        {results.map(recipe => (
          <Card key={recipe.id} style={{ width: 250 }}>
            <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            <CardBody>
              <CardTitle tag="h6">{recipe.title}</CardTitle>
              <CardText style={{ fontSize: 13, minHeight: 40 }}>
                {recipe.summary ? recipe.summary.replace(/<[^>]+>/g, '').slice(0, 80) + '...' : ''}
              </CardText>
              <Button size="sm" color="success" onClick={() => onImport && onImport(recipe)}>
                Import
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
