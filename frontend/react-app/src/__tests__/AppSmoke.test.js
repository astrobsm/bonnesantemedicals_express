import { render, screen } from '@testing-library/react';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';

test('renders main navigation and login', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // There may be multiple 'Login' elements (button, heading)
  expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
});

// Add more smoke/component tests as needed
