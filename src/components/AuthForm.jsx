import { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, Card, CardBody, Alert } from 'reactstrap';

export default function AuthForm({ onAuth, error, isRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onAuth({ email, password });
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <h2 className="mb-3">{isRegister ? 'Register' : 'Login'}</h2>
          {error && <Alert color="danger">{error}</Alert>}
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" type="submit">
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
