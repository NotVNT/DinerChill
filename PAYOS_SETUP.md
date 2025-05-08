# PayOS Integration Setup

## Overview
This document explains how to set up PayOS payment integration with DinerChill. The implementation allows users to pay for products using the PayOS payment gateway which provides a QR code for payment.

## Installation Steps

1. Install the PayOS Node.js package in the backend:
   ```
   cd backend
   npm install @payos/node
   ```

2. Create or update the `.env` file in the `backend` directory with your PayOS credentials:
   ```
   # PayOS Settings
   PAYOS_CLIENT_ID=YOUR_PAYOS_CLIENT_ID
   PAYOS_API_KEY=YOUR_PAYOS_API_KEY
   PAYOS_CHECKSUM_KEY=YOUR_PAYOS_CHECKSUM_KEY
   
   # Frontend URL (used for redirects after payment)
   FRONTEND_URL=http://localhost:3000
   ```

3. Get your PayOS API credentials:
   - Create an account on [PayOS](https://payos.vn/)
   - Create a payment channel
   - Obtain the Client ID, API Key, and Checksum Key

## How It Works

1. When a user clicks "Mua ngay" (Buy now) on the test payment page, the application makes a request to the backend API.
2. The backend creates a payment link using the PayOS SDK.
3. The user is redirected to the PayOS payment page with a QR code.
4. After scanning the QR code and completing payment, the user is redirected back to the application.

## API Endpoints

- `POST /api/payment/create` - Creates a payment link
  - Request body: 
    ```json
    {
      "amount": 50000,
      "orderInfo": "Payment description",
      "productId": 2
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "checkoutUrl": "https://pay.payos.vn/...",
      "qrCode": "data:image/png;base64,...",
      "paymentLinkId": "..."
    }
    ```

- `GET /api/payment/info/:orderCode` - Gets payment information
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "id": "...",
        "orderCode": 1234567890,
        "amount": 50000,
        "amountPaid": 50000,
        "status": "PAID",
        "..."
      }
    }
    ```

## Webhook Integration

PayOS can send payment notifications to your backend using webhooks. To set up a webhook:

1. Create a publicly accessible endpoint in your application at `/api/payment/webhook`
2. Configure this webhook URL in your PayOS dashboard
3. Implement webhook processing logic in your application

## Testing

Use the TestPaymentPage to test the payment flow. It displays products with "Buy now" buttons that will trigger the payment process. 