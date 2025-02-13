import Pomodoro from "@/components/pomodoro";

export default function Timer() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Focus Timer</h1>
      <Pomodoro />
    </div>
  );
}
