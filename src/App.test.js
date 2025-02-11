import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('App Component', () => {
  test('renders Recipe Finder navigation brand', () => {
    render(<App />);
    const navBrand = screen.getByText(/Recipe Finder/i, { selector: 'a.nav-brand' });
    expect(navBrand).toBeInTheDocument();
  });

  test('renders Recipe Finder heading', () => {
    render(<App />);
    const heading = screen.getByText(/🍽️ Recipe Finder/i, { selector: 'h1' });
    expect(heading).toBeInTheDocument();
  });

  test('renders login and register links when user is not logged in', () => {
    render(<App />);
    const loginLink = screen.getByText(/login/i);
    const registerLink = screen.getByText(/register/i);
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });
});
