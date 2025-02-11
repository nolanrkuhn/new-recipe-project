import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

describe('App Component', () => {
  test('renders Recipe Finder link', () => {
    render(<App />);
    const linkElement = screen.getByText(/Recipe Finder/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders login and register links when user is not logged in', () => {
    render(<App />);
    const loginLink = screen.getByText(/login/i);
    const registerLink = screen.getByText(/register/i);
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });
});
