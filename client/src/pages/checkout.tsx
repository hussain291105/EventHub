import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem } from "@/components/shopping-cart";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;
const ENABLE_MOCK_PAYMENTS = import.meta.env.VITE_ENABLE_MOCK_PAYMENTS === 'true' || true; // Enable by default for development

interface CheckoutFormProps {
  cartItems: CartItem[];
  customerName: string;
  customerEmail: string;
  onSuccess: () => void;
}

function CheckoutForm({ cartItems, customerName, customerEmail, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: customerEmail,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
        <PaymentElement />
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
}

interface MockPaymentFormProps {
  cartItems: CartItem[];
  customerName: string;
  customerEmail: string;
  paymentIntentId: string;
  onSuccess: () => void;
}

function MockPaymentForm({ cartItems, customerName, customerEmail, paymentIntentId, onSuccess }: MockPaymentFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank'>('card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleMockPayment = async () => {
    // Validate payment details
    if (selectedPaymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.routingNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all bank details.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      await apiRequest("POST", "/api/confirm-mock-payment", {
        paymentIntentId,
        paymentMethod: selectedPaymentMethod,
        paymentDetails: selectedPaymentMethod === 'card' ? {
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cardholderName: paymentDetails.cardholderName,
          last4: paymentDetails.cardNumber.slice(-4)
        } : {
          bankName: paymentDetails.bankName,
          accountNumber: paymentDetails.accountNumber.slice(-4),
          routingNumber: paymentDetails.routingNumber
        }
      });

      toast({
        title: "Payment Successful! 🎉",
        description: `Your ${selectedPaymentMethod} payment has been processed successfully.`,
      });

      onSuccess();
      setLocation("/payment-success");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === 'card' 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedPaymentMethod('card')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">💳</span>
              </div>
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === 'bank' 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedPaymentMethod('bank')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">🏦</span>
              </div>
              <div>
                <p className="font-medium">Bank Transfer</p>
                <p className="text-sm text-muted-foreground">Direct bank payment</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Details Form */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">
          {selectedPaymentMethod === 'card' ? 'Card Details' : 'Bank Details'}
        </h3>
        
        {selectedPaymentMethod === 'card' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={paymentDetails.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                placeholder="Chase Bank"
                value={paymentDetails.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={paymentDetails.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                placeholder="021000021"
                value={paymentDetails.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
              />
            </div>
          </div>
        )}
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a demo environment. No real payment will be processed. All transactions are simulated.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        onClick={handleMockPayment}
        className="w-full"
        disabled={isProcessing}
        data-testid="button-complete-mock-payment"
      >
        {isProcessing ? "Processing Payment..." : `Pay with ${selectedPaymentMethod === 'card' ? 'Card' : 'Bank Transfer'}`}
      </Button>
    </div>
  );
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

export default function CheckoutPage({ cartItems, onClearCart }: CheckoutPageProps) {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [step, setStep] = useState<"info" | "payment">("info");
  const [useMockPayment, setUseMockPayment] = useState(false);
  const { toast } = useToast();

  if (!stripePublicKey && !ENABLE_MOCK_PAYMENTS) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment processing is not configured. Please contact support or configure Stripe API keys.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Return to Events
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const handleContinueToPayment = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: total,
        customerEmail,
        customerName,
        cartItems,
      });
      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error("No client secret received from server");
      }
      
      // Always use mock payments for demo
      if (data.clientSecret && data.clientSecret.includes('mock')) {
        // Mock payment
        setUseMockPayment(true);
        setPaymentIntentId(data.clientSecret.split('_secret_')[0]);
      } else if (ENABLE_MOCK_PAYMENTS) {
        // Force mock payment even if Stripe is configured
        setUseMockPayment(true);
        setPaymentIntentId(data.clientSecret || `pi_mock_${Date.now()}`);
      } else {
        // Real Stripe payment
        setClientSecret(data.clientSecret);
        setUseMockPayment(false);
      }
      
      setStep("payment");
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Payment Initialization Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Button onClick={() => setLocation("/")} data-testid="button-browse-events">
          Browse Events
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="flex items-center gap-4 mb-8">
          <Badge variant={step === "info" ? "default" : "secondary"}>1. Information</Badge>
          <div className="flex-1 h-0.5 bg-border"></div>
          <Badge variant={step === "payment" ? "default" : "secondary"}>2. Payment</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "info" ? (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-customer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="john@example.com"
                      data-testid="input-customer-email"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleContinueToPayment}
                  className="w-full mt-6"
                  data-testid="button-continue-payment"
                >
                  Continue to Payment
                </Button>
              </Card>
            ) : (
              useMockPayment ? (
                <MockPaymentForm
                  cartItems={cartItems}
                  customerName={customerName}
                  customerEmail={customerEmail}
                  paymentIntentId={paymentIntentId}
                  onSuccess={onClearCart}
                />
              ) : (
                clientSecret && stripePromise && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      cartItems={cartItems}
                      customerName={customerName}
                      customerEmail={customerEmail}
                      onSuccess={onClearCart}
                    />
                  </Elements>
                )
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <Separator className="mb-4" />

              <div className="space-y-4 mb-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium line-clamp-1">{item.eventTitle}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.ticketTypeName} x {item.quantity}</span>
                      <span>₹{((item.price * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                    {item.seatLabel && (
                      <div className="text-xs text-muted-foreground">{item.seatLabel}</div>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service Fee</span>
                  <span>₹{(serviceFee / 100).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">₹{(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
