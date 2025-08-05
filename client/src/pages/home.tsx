import BottomNavigation from "../components/bottom-navigation";
import { useNavigation } from "@/hooks/use-navigation";

export default function Home() {
  const { getCurrentPage } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white dark:bg-gray-900 shadow-lg">
      {/* Header */}
      <header className="bg-white text-black p-2 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-medium">Home</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
          <p>View quick stats. View a list of friends activities</p>
        </div>
        
        {/* Bottom spacing for FAB */}
        <div className="h-20"></div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={getCurrentPage()} />
    </div>
  );
} 