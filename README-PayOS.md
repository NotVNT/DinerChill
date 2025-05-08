# PayOS Integration for DinerChill

## Overview
This integration allows users to make payments using PayOS QR codes and stores payment information in the database.

## Setup Instructions

1. Install the PayOS Node.js package:
   ```
   cd backend
   npm install @payos/node
   ```

2. Configure your PayOS credentials in the `.env` file:
   ```
   # PayOS Settings
   PAYOS_CLIENT_ID=your_client_id
   PAYOS_API_KEY=your_api_key
   PAYOS_CHECKSUM_KEY=your_checksum_key
   
   # Frontend URL for redirect after payment
   FRONTEND_URL=http://localhost:3000
   ```

3. Get your PayOS credentials from [PayOS Dashboard](https://merchant.payos.vn/):
   - Create an account
   - Create a payment channel
   - Obtain Client ID, API Key, and Checksum Key

## Database Integration

When a payment is successful, the information is stored in the `payment_information` table with:
- `transactionId` field: Contains the order code
- `notes` field: Contains the payment description (Thanh toán + order code)
- Other fields: amount, status, payment date, etc.

Payment information is saved in two ways:
1. When a webhook notification is received from PayOS
2. When checking payment status on the payment result page

## Testing

1. Go to the Test Payment page
2. Select a product and click "Mua ngay"
3. Scan the QR code to complete payment
4. After payment, you'll be redirected to the result page
5. Check the database to confirm the payment information was saved

## Webhook Configuration 

To receive real-time payment notifications, set up a webhook:
1. Make your endpoint publicly accessible (e.g., using ngrok)
2. Configure `/api/payment/webhook` as your webhook URL in PayOS dashboard
3. PayOS will send notifications to this endpoint when payments are made 