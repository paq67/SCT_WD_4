import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { 
  Layout,
  CheckCircle,
  Timer,
  User as UserIcon,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/profile"]
  });

  const xpForNextLevel = (user?.level || 1) * 100;
  const progress = ((user?.xp || 0) % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="h-6 w-6" />
            <span className="font-bold">HabitQuest</span>
          </div>
          
          {!isLoading && user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="font-medium">Level {user.level}</div>
                <Progress value={progress} className="w-32 h-2" />
              </div>
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        <nav className="w-48 space-y-2">
          <Button
            variant={location === "/" ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/">
              <CheckCircle className="mr-2 h-4 w-4" />
              Habits
            </Link>
          </Button>
          
          <Button
            variant={location === "/timer" ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/timer">
              <Timer className="mr-2 h-4 w-4" />
              Timer
            </Link>
          </Button>
          
          <Button
            variant={location === "/profile" ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Theme
          </Button>
        </nav>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
