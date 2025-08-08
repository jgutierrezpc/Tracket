import { useLocation } from "wouter";

export function useNavigation() {
  const [location, setLocation] = useLocation();

  const getCurrentPage = (): 'home' | 'courts' | 'friends' | 'profile' | 'settings' => {
    switch (location) {
      case '/':
        return 'home';
      case '/courts':
        return 'courts';
      case '/friends':
        return 'friends';
      case '/profile':
        return 'profile';
      case '/settings':
        return 'settings';
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
      case 'settings':
        setLocation('/settings');
        break;
      case 'addEquipment':
        setLocation('/equipment/add');
        break;
      default:
        setLocation('/');
    }
  };

  return { navigate, getCurrentPage };
} 