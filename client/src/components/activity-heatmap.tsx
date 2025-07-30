import { Activity } from "@shared/schema";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityHeatmapProps {
  activities: Activity[];
}

interface HeatmapData {
  [date: string]: number; // minutes of activity
}

interface HeatmapCell {
  date: string;
  level: number;
  minutes: number;
  dayOfWeek: number;
  month: number;
  dayOfMonth: number;
}

interface MonthLabel {
  weekIndex: number;
  month: number;
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const heatmapData = useMemo(() => {
    const data: HeatmapData = {};
    
    activities.forEach(activity => {
      const date = activity.date;
      data[date] = (data[date] || 0) + activity.duration;
    });
    
    return data;
  }, [activities]);

  const generateHeatmapCells = (): HeatmapCell[] => {
    const cells: HeatmapCell[] = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Generate cells for the year
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const minutes = heatmapData[dateStr] || 0;
      let level = 0;
      
      if (minutes > 0) {
        if (minutes >= 180) level = 4;
        else if (minutes >= 120) level = 3;
        else if (minutes >= 60) level = 2;
        else level = 1;
      }
      
      // Convert Sunday (0) to be day 6, Monday (1) to be day 0, etc.
      const dayOfWeek = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
      
      cells.push({
        date: dateStr,
        level,
        minutes,
        dayOfWeek,
        month: currentDate.getMonth(),
        dayOfMonth: currentDate.getDate(),
      });
    }
    
    return cells;
  };

  const cells = generateHeatmapCells();
  
  // Group cells by weeks, with days as rows
  const weeks: (HeatmapCell | null)[][] = [];
  let currentWeek: (HeatmapCell | null)[] = [];

  // Find the first day of the year and pad the beginning
  const firstDay = cells[0];
  const firstDayOfWeek = firstDay?.dayOfWeek || 0;
  
  // Pad the first week with empty cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  cells.forEach((cell, index) => {
    currentWeek.push(cell);
    
    // If we've filled a week (7 days) or reached the end, push the week
    if (currentWeek.length === 7 || index === cells.length - 1) {
      // Pad the last week with empty cells if needed
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Generate month labels for the top
  const monthLabels: MonthLabel[] = [];
  let currentMonth = -1;
  
  weeks.forEach((week, wIndex) => {
    const firstCellWithData = week.find((cell): cell is HeatmapCell => cell !== null);
    if (firstCellWithData && firstCellWithData.month !== currentMonth) {
      if (firstCellWithData.dayOfMonth <= 7) { // Only show if it's early in the month
        monthLabels.push({
          weekIndex: wIndex,
          month: firstCellWithData.month
        });
      }
      currentMonth = firstCellWithData.month;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    activities.forEach(activity => {
      const year = new Date(activity.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Activity Calendar</h2>
        <div className="flex items-center space-x-4">
          {/* Year Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="h-8 w-8"
              data-testid="button-prev-year"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {selectedYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="h-8 w-8"
              data-testid="button-next-year"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-800 dark:bg-green-300 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">        
        <div className="relative">
          {/* Sticky day labels (left side) */}
          <div className="absolute left-0 top-0 z-10 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col justify-start text-xs text-gray-600 dark:text-gray-400 pr-1">
              <div className="h-4 mb-2"></div> {/* Space for month labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} className="h-3 mb-1 flex items-center min-w-[28px]">
                  {i % 2 === 0 ? day : ''} {/* Show Mon, Wed, Fri, Sun */}
                </div>
              ))}
            </div>
          </div>
          
          {/* Scrollable heatmap container */}
          <div className="overflow-x-auto ml-8">
            {/* Month labels */}
            <div className="flex mb-2 h-4">
              {weeks.map((_, weekIndex) => {
                const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                return (
                  <div key={weekIndex} className="w-3 mr-1 text-xs text-gray-600 dark:text-gray-400">
                    {monthLabel ? monthNames[monthLabel.month] : ''}
                  </div>
                );
              })}
            </div>
            
            {/* Days grid - organized as rows (weekdays) by columns (weeks) */}
            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => (
              <div key={dayOfWeek} className="flex gap-1 mb-1">
                {weeks.map((week, weekIndex) => {
                  const cell = week[dayOfWeek];
                  
                  if (!cell) {
                    return <div key={weekIndex} className="w-3 h-3" />;
                  }
                  
                  const levelColors = [
                    'bg-gray-200 dark:bg-gray-700',
                    'bg-green-200 dark:bg-green-900',
                    'bg-green-400 dark:bg-green-700',
                    'bg-green-600 dark:bg-green-500',
                    'bg-green-800 dark:bg-green-300'
                  ];
                  
                  return (
                    <div
                      key={weekIndex}
                      className={`w-3 h-3 rounded-sm ${levelColors[cell.level]} cursor-pointer hover:opacity-80`}
                      title={`${cell.date}: ${cell.minutes} minutes`}
                      data-testid={`heatmap-cell-${cell.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}