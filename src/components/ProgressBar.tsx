'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
      <div
        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
