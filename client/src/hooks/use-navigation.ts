import { useLocation } from "wouter";

export function useNavigation() {
  const [location, setLocation] = useLocation();

  const getCurrentPage = (): 'home' | 'courts' | 'friends' | 'profile' => {
    switch (location) {
      case '/':
        return 'home';
      case '/courts':
        return 'courts';
      case '/friends':
        return 'friends';
      case '/profile':
        return 'profile';
      default:
        return 'home';
    }
  };

  const navigate = (page: string) => {
    switch (page) {
      case 'home':
        setLocation('/');
        break;
      case 'courts':
        setLocation('/courts');
        break;
      case 'friends':
        setLocation('/friends');
        break;
      case 'profile':
        setLocation('/profile');
        break;
      default:
        setLocation('/');
    }
  };

  return { navigate, getCurrentPage };
} 