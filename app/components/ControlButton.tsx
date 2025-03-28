import { useState } from "react";

type ControlButtonProps = {
  className?: string;
  children?: React.ReactNode;
  onClick: () => void;
};

export function ControlButton({ children, onClick, className }: ControlButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      className={`w-12 h-12 bg-[#0052FF] rounded-full cursor-pointer select-none
        transition-all duration-150 border-[1px] border-[#0052FF] ${className}
        ${
          isPressed
            ? "translate-y-1 [box-shadow:0_0px_0_0_#002299,0_0px_0_0_#0033cc33] border-b-[0px]"
            : "[box-shadow:0_5px_0_0_#002299,0_8px_0_0_#0033cc33]"
        }`}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}