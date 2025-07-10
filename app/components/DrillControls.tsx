import React from 'react';

// Define the types for the props the component will receive
type DrillControlsProps = {
  granularity: 'live' | 'day' | 'month';
  setGranularity: (value: 'live' | 'day' | 'month') => void;
};

export default function DrillControls({ granularity, setGranularity }: DrillControlsProps) {
  // No local state needed here anymore
  
  return (
    <div className="flex justify-end space-x-2 mb-4">
      <button
        onClick={() => setGranularity('live')}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          granularity === 'live'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Live
      </button>
      <button
        onClick={() => setGranularity('day')}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          granularity === 'day'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Per Day
      </button>
      <button
        onClick={() => setGranularity('month')}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          granularity === 'month'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Per Month
      </button>
    </div>
  );
}