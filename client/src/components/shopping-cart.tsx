import { ShoppingCart, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export interface CartItem {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketTypeId: string;
  ticketTypeName: string;
  seatId?: string;
  seatLabel?: string;
  price: number;
  quantity: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onRemoveItem: (ticketTypeId: string, seatId?: string) => void;
  onCheckout: () => void;
}

export function ShoppingCartComponent({ items, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" data-testid="button-cart">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? "Your cart is empty" : `${itemCount} item${itemCount !== 1 ? "s" : ""} in cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
              <p>No tickets in your cart yet</p>
              <p className="text-sm mt-2">Browse events to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.ticketTypeId}-${item.seatId || index}`} className="flex gap-4" data-testid={`cart-item-${index}`}>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm line-clamp-1">{item.eventTitle}</h4>
                    <p className="text-xs text-muted-foreground">{item.eventDate}</p>
                    <p className="text-xs text-muted-foreground">{item.eventVenue}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{item.ticketTypeName}</Badge>
                      {item.seatLabel && (
                        <Badge variant="outline" className="text-xs">{item.seatLabel}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">Qty: {item.quantity}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.ticketTypeId, item.seatId)}
                    data-testid={`button-remove-item-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service Fee</span>
                  <span>₹{(serviceFee / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-cart-total">₹{(total / 100).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" onClick={onCheckout} data-testid="button-checkout">
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
