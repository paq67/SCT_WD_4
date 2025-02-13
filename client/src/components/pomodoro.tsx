import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { soundManager } from "@/lib/sounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

type TimerMode = "focus" | "break";

export default function Pomodoro() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [sound, setSound] = useState<string>("rain");
  const [volume, setVolume] = useState([0.5]);

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: new Date(Date.now() + FOCUS_TIME * 1000),
    onExpire: () => {
      if (mode === "focus") {
        setMode("break");
        restart(new Date(Date.now() + BREAK_TIME * 1000));
      } else {
        setMode("focus");
        restart(new Date(Date.now() + FOCUS_TIME * 1000));
      }
    },
    autoStart: false
  });

  useEffect(() => {
    soundManager.setVolume(volume[0]);
  }, [volume]);

  const toggleTimer = () => {
    if (isRunning) {
      pause();
      soundManager.stop();
    } else {
      start();
      soundManager.play(sound as any);
    }
  };

  const resetTimer = () => {
    const time = mode === "focus" ? FOCUS_TIME : BREAK_TIME;
    restart(new Date(Date.now() + time * 1000), false);
    soundManager.stop();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {mode === "focus" ? "Focus Time" : "Break Time"}
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={toggleTimer}>
            {isRunning ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={sound}
              onValueChange={(value) => {
                setSound(value);
                if (isRunning) {
                  soundManager.play(value as any);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sound" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="cafe">Café</SelectItem>
                <SelectItem value="whitenoise">White Noise</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 flex-1">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
