import { MoveState } from "../utils";


type DPadProps = {
  onDirectionChange: (direction: number) => void;
};

export function DPad({ onDirectionChange }: DPadProps) {
  return (
    <div className="flex">
      <div className="grid grid-cols-3">
        <div className="h-12 w-12" />
        <button
          className="h-12 w-12 bg-black rounded-t-lg hover:shadow-dpad-hover active:shadow-dpad-pressed active:translate-y-[1px] bg-dpad-gradient shadow-dpad"
          onClick={() => onDirectionChange(MoveState.UP)}
        />
        <div className="h-12 w-12" />
        <button
          className="h-12 w-12 bg-black rounded-t-lg hover:shadow-dpad-hover active:shadow-dpad-pressed active:translate-x-[1px] bg-dpad-gradient -rotate-90"
          onClick={() => onDirectionChange(MoveState.LEFT)}
        />
        <div className="h-12 w-12 bg-black" />
        <button
          className="h-12 w-12 bg-black rounded-t-lg hover:shadow-dpad-hover active:shadow-dpad-pressed active:translate-x-[-1px] bg-dpad-gradient shadow-dpad rotate-90"
          onClick={() => onDirectionChange(MoveState.RIGHT)}
        />
        <div className="h-12 w-12" />
        <button
          className="h-12 w-12 bg-black rounded-t-lg hover:shadow-dpad-hover active:shadow-dpad-pressed active:translate-y-[-1px] bg-dpad-gradient shadow-dpad rotate-180"
          onClick={() => onDirectionChange(MoveState.DOWN)}
        />
        <div className="h-12 w-12" />
      </div>
    </div>
  );
}