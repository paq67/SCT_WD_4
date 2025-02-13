import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Habit } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HabitList() {
  const queryClient = useQueryClient();
  
  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const completeMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const res = await apiRequest("POST", "/api/completions", { habitId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (habitId: number) => {
      await apiRequest("DELETE", `/api/habits/${habitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });

  if (isLoading) {
    return <div>Loading habits...</div>;
  }

  return (
    <div className="space-y-4">
      {habits?.map(habit => (
        <Card key={habit.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{habit.name}</CardTitle>
                {habit.description && (
                  <CardDescription>{habit.description}</CardDescription>
                )}
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete habit</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this habit? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(habit.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress
                value={(habit.current / habit.target) * 100}
                className="flex-1"
              />
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {habit.current} / {habit.target}
              </div>
              <Button
                size="sm"
                disabled={habit.current >= habit.target}
                onClick={() => completeMutation.mutate(habit.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {habits?.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No habits yet. Create your first habit to get started!
        </div>
      )}
    </div>
  );
}
