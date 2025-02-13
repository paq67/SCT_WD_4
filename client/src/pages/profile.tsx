import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import Character from "@/components/character";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/profile"],
  });

  if (!user) return null;

  const xpForNextLevel = user.level * 100;
  const progress = (user.xp % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <Character level={user.level} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level {user.level}</span>
                  <span>{user.xp % xpForNextLevel} / {xpForNextLevel} XP</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unlocked Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Ambient Sounds</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {user.unlockedSounds.map(sound => (
                      <div key={sound} className="p-2 bg-secondary rounded text-sm">
                        {sound}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Backgrounds</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {user.unlockedBackgrounds.map(bg => (
                      <div key={bg} className="p-2 bg-secondary rounded text-sm">
                        {bg}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Character Items</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {user.unlockedCharacters.map(item => (
                      <div key={item} className="p-2 bg-secondary rounded text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
