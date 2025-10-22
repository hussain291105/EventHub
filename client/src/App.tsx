import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { ShoppingCartComponent, type CartItem } from "@/components/shopping-cart";
import Home from "@/pages/home";
import EventDetail from "@/pages/event-detail";
import CheckoutPage from "@/pages/checkout";
import MyTickets from "@/pages/my-tickets";
import Organizer from "@/pages/organizer";
import NotFound from "@/pages/not-found";

function Router() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.ticketTypeId === item.ticketTypeId &&
          i.eventId === item.eventId &&
          i.seatId === item.seatId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }

      return [...prev, item];
    });
  };

  const handleRemoveFromCart = (ticketTypeId: string, seatId?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.ticketTypeId === ticketTypeId && item.seatId === seatId)
      )
    );
  };

  const handleCheckout = () => {
    setLocation("/checkout");
  };

  const handleClearCart = () => {
    setCartItems([]);
    setLocation("/my-tickets");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="fixed bottom-6 right-6 z-50">
        <ShoppingCartComponent
          items={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </div>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/event/:id">
          {(params) => <EventDetail onAddToCart={handleAddToCart} />}
        </Route>
        <Route path="/checkout">
          {() => <CheckoutPage cartItems={cartItems} onClearCart={handleClearCart} />}
        </Route>
        <Route path="/my-tickets" component={MyTickets} />
        <Route path="/organizer" component={Organizer} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
