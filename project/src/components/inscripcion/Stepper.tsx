import { CheckCircle2 } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Circle + label column */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'border-green-500 bg-green-50'
                      : isActive
                      ? 'border-blue-600 bg-blue-600 shadow-lg shadow-blue-200'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className={`text-sm font-bold leading-none ${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </button>
                <p className={`text-xs font-medium mt-2 text-center whitespace-nowrap ${
                  isActive ? 'text-blue-700 font-semibold' : isCompleted ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step}
                </p>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-3 mb-6 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
