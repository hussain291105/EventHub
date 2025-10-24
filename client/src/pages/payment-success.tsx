import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    localStorage.removeItem("cart");
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to defer the navigation to avoid setState during render
          setTimeout(() => setLocation("/my-tickets"), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your tickets have been booked successfully. You'll receive a confirmation email shortly.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Redirecting to your tickets in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation("/")}
              data-testid="button-browse-more"
            >
              Browse More Events
            </Button>
            <Button
              className="flex-1"
              onClick={() => setLocation("/my-tickets")}
              data-testid="button-view-tickets"
            >
              View My Tickets
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
