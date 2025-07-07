import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders main navigation and login', () => {
  render(<App />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});

// Add more smoke/component tests as needed
