import React, { useState } from "react";
import { House, MapPin, Plus, UserPlus, FileChartColumn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AddActivityForm from "./add-activity-form";
import { useNavigation } from "@/hooks/use-navigation";

interface BottomNavigationProps {
  currentPage?: 'home' | 'courts' | 'friends' | 'profile';
}

export default function BottomNavigation({ currentPage = 'home' }: BottomNavigationProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { navigate } = useNavigation();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: House,
      testId: 'nav-home'
    },
    {
      id: 'courts',
      label: 'Courts',
      icon: MapPin,
      testId: 'nav-courts'
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: UserPlus,
      testId: 'nav-friends'
    },
    {
      id: 'profile',
      label: 'You',
      icon: FileChartColumn,
      testId: 'nav-profile'
    }
  ];

  const handleNavigationClick = (pageId: string) => {
    navigate(pageId);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
      <div className="flex items-center justify-around py-2 mb-2 relative">
        {/* Left navigation items */}
        {navigationItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
              onClick={() => handleNavigationClick(item.id)}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
        
        {/* Center Add Button */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="w-8 h-8 bg-primary text-white hover:text-secondary rounded-full mb-4"
              size="icon"
              variant="ghost"
              data-testid="button-add-activity"
            >
              <Plus className="h-10 w-10" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0">
            <AddActivityForm onClose={() => setIsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Right navigation items */}
        {navigationItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
              onClick={() => handleNavigationClick(item.id)}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
} 