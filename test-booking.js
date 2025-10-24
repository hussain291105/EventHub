// Simple test script to verify booking functionality
const testBookingFlow = async () => {
  try {
    console.log('Testing booking flow...');

    // 👇 Use environment variable if available
    const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

    // 1. Get events
    const eventsResponse = await fetch(`${API_BASE}/api/events`);
    const events = await eventsResponse.json();
    console.log('Events found:', events.length);

    if (events.length === 0) {
      console.error('No events found!');
      return;
    }

    const firstEvent = events[0];
    console.log('Using event:', firstEvent.title);

    // 2. Get ticket types
    const ticketTypesResponse = await fetch(`${API_BASE}/api/events/${firstEvent.id}/ticket-types`);
    const ticketTypes = await ticketTypesResponse.json();
    console.log('Ticket types found:', ticketTypes.length);

    if (ticketTypes.length === 0) {
      console.error('No ticket types found!');
      return;
    }

    const firstTicketType = ticketTypes[0];
    console.log('Using ticket type:', firstTicketType.name, 'Price:', firstTicketType.price);

    // 3. Create payment intent
    const cartItems = [{
      eventId: firstEvent.id,
      eventTitle: firstEvent.title,
      eventDate: firstEvent.date,
      eventVenue: firstEvent.venue,
      ticketTypeId: firstTicketType.id,
      ticketTypeName: firstTicketType.name,
      price: firstTicketType.price,
      quantity: 1
    }];

    const paymentIntentResponse = await fetch(`${API_BASE}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: firstTicketType.price,
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        cartItems
      })
    });

    const paymentData = await paymentIntentResponse.json();
    console.log('Payment intent created:', paymentData.clientSecret);

    if (!paymentData.clientSecret) {
      console.error('Failed to create payment intent');
      return;
    }

    const paymentIntentId = paymentData.clientSecret.split('_secret_')[0];

    // 4. Confirm mock payment
    const confirmResponse = await fetch(`${API_BASE}/api/confirm-mock-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        paymentMethod: 'card',
        paymentDetails: {
          cardNumber: '4242424242424242',
          expiryDate: '12/25',
          cardholderName: 'Test User',
          last4: '4242'
        }
      })
    });

    const confirmData = await confirmResponse.json();
    console.log('Payment confirmed:', confirmData.success);

    // 5. Check bookings
    const bookingsResponse = await fetch(`${API_BASE}/api/bookings`);
    const bookings = await bookingsResponse.json();
    console.log('Bookings found:', bookings.length);

    if (bookings.length > 0) {
      console.log('First booking:', {
        id: bookings[0].id,
        eventTitle: bookings[0].event?.title,
        paymentStatus: bookings[0].paymentStatus,
        itemsCount: bookings[0].items?.length
      });
    }

    // 6. Check debug endpoint
    const debugResponse = await fetch(`${API_BASE}/api/debug/bookings`);
    const debugData = await debugResponse.json();
    console.log('Debug data:', {
      totalBookings: debugData.totalBookings,
      successfulBookings: debugData.successfulBookings,
      eventsCount: debugData.events.length
    });

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testBookingFlow();
