import { Activity } from "@shared/schema";
import { useMemo } from "react";

interface ActivityHeatmapProps {
  activities: Activity[];
}

interface HeatmapData {
  [date: string]: number; // minutes of activity
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const data: HeatmapData = {};
    
    activities.forEach(activity => {
      const date = activity.date;
      data[date] = (data[date] || 0) + activity.duration;
    });
    
    return data;
  }, [activities]);

  const generateHeatmapCells = () => {
    const cells = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Generate 365 days of cells
    for (let i = 0; i < 365; i++) {
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
      
      const dayOfWeek = currentDate.getDay();
      const weekOfYear = Math.floor(i / 7);
      
      cells.push({
        date: dateStr,
        level,
        minutes,
        dayOfWeek,
        weekOfYear,
      });
    }
    
    return cells;
  };

  const cells = generateHeatmapCells();
  const weeks = Math.ceil(cells.length / 7);

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Activity Calendar</h2>
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
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {new Date().getFullYear() - 1} - {new Date().getFullYear()}
        </div>
        
        <div className="flex">
          {/* Month labels */}
          <div className="flex flex-col justify-start text-xs text-gray-600 dark:text-gray-400 pr-2">
            {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
              <div key={i} className="h-3 mb-1">{month}</div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex flex-col">
            {/* Weekday labels */}
            <div className="flex mb-1">
              {Array.from({ length: weeks }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col mr-1">
                  {weekIndex === 0 && (
                    <div className="grid grid-rows-7 gap-1 text-xs text-gray-600 dark:text-gray-400 mr-2">
                      <div className="h-3">S</div>
                      <div className="h-3">M</div>
                      <div className="h-3">T</div>
                      <div className="h-3">W</div>
                      <div className="h-3">T</div>
                      <div className="h-3">F</div>
                      <div className="h-3">S</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Heatmap cells organized by weeks */}
            <div className="flex">
              {Array.from({ length: weeks }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col mr-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                    const cellIndex = weekIndex * 7 + dayOfWeek;
                    const cell = cells[cellIndex];
                    
                    if (!cell) return <div key={dayOfWeek} className="w-3 h-3 mb-1" />;
                    
                    const levelColors = [
                      'bg-gray-200 dark:bg-gray-700',
                      'bg-green-200 dark:bg-green-900',
                      'bg-green-400 dark:bg-green-700',
                      'bg-green-600 dark:bg-green-500',
                      'bg-green-800 dark:bg-green-300'
                    ];
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayOfWeek}`}
                        className={`w-3 h-3 rounded-sm mb-1 ${levelColors[cell.level]} cursor-pointer hover:opacity-80`}
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
      </div>
    </section>
  );
}
