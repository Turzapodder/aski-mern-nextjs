import { STEPS } from './steps';

interface StepSidebarProps {
  currentStep: number;
}

export function StepSidebar({ currentStep }: StepSidebarProps) {
  return (
    <div className="w-full lg:w-80 bg-gray-50 p-4 sm:p-6 lg:p-8 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Tutor Application</h1>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="relative">
            <div
              className={`flex items-center space-x-3 pt-4 ${
                step.id <= currentStep ? 'text-primary-950' : 'text-gray-400'
              }`}
            >
              <step.icon className="h-6 w-6 z-10 relative" />
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-xs">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className="absolute left-3 w-0.5 h-[20px] sm:h-[25px] -ml-[1px] bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
