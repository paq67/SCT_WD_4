import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShopItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coins } from "lucide-react";

export default function Shop() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading: itemsLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop"],
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("POST", "/api/shop/purchase", { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Item purchased!",
        description: "The item has been added to your inventory."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (itemsLoading || userLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <div className="flex items-center gap-2 text-lg font-medium">
          <Coins className="h-5 w-5" />
          {user?.coins || 0} coins
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="mt-4 w-full h-32 object-contain"
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                <span>{item.price}</span>
              </div>
              <Button
                onClick={() => purchaseMutation.mutate(item.id)}
                disabled={
                  purchaseMutation.isPending ||
                  (user?.coins || 0) < item.price ||
                  user?.inventory.includes(item.name)
                }
              >
                {user?.inventory.includes(item.name) ? "Owned" : "Purchase"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {items?.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No items available in the shop right now.
        </div>
      )}
    </div>
  );
}
