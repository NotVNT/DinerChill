const express = require("express");
const router = express.Router();
const PayOS = require("@payos/node"); // This will need to be installed via npm
const { PaymentInformation, User, Reservation } = require("../models");
const { sendPaymentConfirmationEmail } = require("../utils/emailService");
const config = require("../config/payosAPI");

// Initialize PayOS SDK with credentials from config
let payos;
try {
  // Check if all required credentials are available
  const { clientId, apiKey, checksumKey } = config.payos;

  if (clientId && apiKey && checksumKey) {
    payos = new PayOS(clientId, apiKey, checksumKey);
    console.log("PayOS initialized successfully");
  } else {
    console.warn(
      "PayOS credentials missing. Payment functionality will be limited."
    );
  }
} catch (error) {
  console.error("Error initializing PayOS:", error);
}

// Create payment link route
router.post("/create", async (req, res) => {
  try {
    // Check if PayOS is properly initialized
    if (!payos) {
      // For testing purposes, we'll return a mock response
      console.log("PayOS not initialized, returning mock response");
      const mockOrderCode = Date.now().toString();
      return res.json({
        success: true,
        checkoutUrl:
          "https://pay.payos.vn/web/7e36a8cb5ff34c4e8d0fc93dd06a8c0/",
        qrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        paymentLinkId: mockOrderCode,
        orderCode: mockOrderCode,
      });
    }

    const { amount, orderInfo, reservationId } = req.body;

    // Validate input
    if (!amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters (amount, orderInfo)",
      });
    }

    // Format orderCode - must be unique for each payment link
    const orderCode = Date.now();

    // Create payment description - limited to 25 characters max for PayOS
    const description = `Đặt cọc #${orderCode.toString().slice(-6)}`;

    // Create payment link request data
    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      items: [
        {
          name: orderInfo.length > 25 ? orderInfo.substring(0, 25) : orderInfo,
          quantity: 1,
          price: amount,
        },
      ],
      // Return URL after payment completion (frontend URL)
      returnUrl: `${config.appUrl}/payment-result?orderCode=${orderCode}${
        reservationId ? `&reservationId=${reservationId}` : ""
      }`,
      // Cancel URL - redirect to payment result page with cancelled status
      cancelUrl: `${config.appUrl}/payment-result?cancelled=true${
        reservationId ? `&reservationId=${reservationId}` : ""
      }`,
      // Add reservationId in additionalData if provided
      additionalData: reservationId
        ? JSON.stringify({ reservationId })
        : undefined,
    };

    // Create payment link using PayOS SDK
    const paymentLinkResponse = await payos.createPaymentLink(paymentData);

    // Return the payment link info to the client
    res.json({
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
      orderCode: orderCode,
      reservationId: reservationId || null,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment link",
      error: error.message,
    });
  }
});

// Get payment link information
router.get("/info/:orderCode", async (req, res) => {
  try {
    const { orderCode } = req.params;
    const { reservationId } = req.query; // Get reservation ID from query params if provided

    // First, check if payment already exists in database to avoid duplicates
    const existingPayment = await PaymentInformation.findOne({
      where: { transactionId: orderCode.toString() },
    });

    if (existingPayment) {
      console.log(`Payment for order ${orderCode} found in database`);

      // Parse payment details if it's a JSON string
      let paymentDetailsObj = {};
      try {
        paymentDetailsObj =
          typeof existingPayment.paymentDetails === "string"
            ? JSON.parse(existingPayment.paymentDetails)
            : existingPayment.paymentDetails;
      } catch (e) {
        console.warn("Could not parse payment details JSON:", e);
      }

      // If payment is completed and we have a reservationId, update reservation status
      if (
        existingPayment.status === "completed" &&
        (reservationId || existingPayment.reservationId)
      ) {
        try {
          const resId = reservationId || existingPayment.reservationId;

          // Update reservation if not already linked
          if (!existingPayment.reservationId && reservationId) {
            await existingPayment.update({ reservationId });
          }

          // Update reservation status
          const reservation = await Reservation.findByPk(resId);
          if (reservation && reservation.status === "pending") {
            await reservation.update({ status: "confirmed" });
            console.log(`Updated reservation #${resId} status to confirmed`);
          }
        } catch (error) {
          console.error("Error updating reservation status:", error);
        }
      }

      // Return a formatted response that matches what the frontend expects
      return res.json({
        success: true,
        data: {
          id: existingPayment.id,
          orderCode: existingPayment.transactionId,
          amount: existingPayment.amount,
          amountPaid: existingPayment.amount, // Assume fully paid if in database with completed status
          amountRemaining: 0,
          status:
            existingPayment.status === "completed"
              ? "PAID"
              : existingPayment.status.toUpperCase(),
          createdAt: existingPayment.createdAt,
          reservationId: existingPayment.reservationId || reservationId || null,
          transactions: [
            {
              reference: paymentDetailsObj.reference || "transaction",
              amount: existingPayment.amount,
              description: existingPayment.notes,
              transactionDateTime: existingPayment.paymentDate,
            },
          ],
        },
      });
    }

    // Check if PayOS is properly initialized
    if (!payos) {
      // For testing purposes, return a mock payment info
      const mockInfo = {
        id: "mock-payment-id",
        orderCode: orderCode,
        amount: 50000,
        amountPaid: 50000,
        amountRemaining: 0,
        status: "PAID",
        createdAt: new Date().toISOString(),
        transactions: [
          {
            reference: "mock-transaction",
            amount: 50000,
            accountNumber: "123456789",
            description: reservationId
              ? `Thanh toán đặt bàn reservation=${reservationId}`
              : `Thanh toán ${orderCode}`,
            transactionDateTime: new Date().toISOString(),
          },
        ],
      };

      // Save mock payment to database for testing
      try {
        let payment;
        // Create the payment record directly
        payment = await PaymentInformation.create({
          userId: 1, // Default user ID
          transactionId: orderCode.toString(), // Save order code in transactionId
          paymentMethod: "bank_transfer",
          amount: mockInfo.amount,
          currency: "VND",
          status: "completed",
          paymentDate: new Date(),
          paymentDetails: JSON.stringify(mockInfo),
          notes: mockInfo.transactions[0].description, // Save description in notes
          reservationId: reservationId || null, // Link to reservation if ID provided
        });

        console.log(`Mock payment information saved for order ${orderCode}`);

        // If we have a reservation ID, update the reservation status
        if (reservationId) {
          try {
            const reservation = await Reservation.findByPk(reservationId);
            if (reservation) {
              await reservation.update({ status: "confirmed" });
              console.log(
                `Updated reservation #${reservationId} status to confirmed`
              );
            }
          } catch (error) {
            console.error("Error updating reservation status:", error);
          }
        }

        // Find user email and send payment confirmation email
        try {
          const user = await User.findOne({ where: { id: 1 } });
          if (user && user.email) {
            await sendPaymentConfirmationEmail(user.email, {
              transactionId: orderCode.toString(),
              amount: mockInfo.amount,
              paymentMethod: "bank_transfer",
              paymentDate: new Date(),
              status: "completed",
            });
            console.log(`Payment confirmation email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error(
            "Error sending payment confirmation email:",
            emailError
          );
        }
      } catch (dbError) {
        console.error("Error saving mock payment:", dbError);
      }

      return res.json({
        success: true,
        data: {
          ...mockInfo,
          reservationId: reservationId || null,
        },
      });
    }

    try {
      const paymentLinkInfo = await payos.getPaymentLinkInformation(orderCode);

      // If payment is successful, save to database
      if (
        paymentLinkInfo &&
        (paymentLinkInfo.status === "PAID" ||
          paymentLinkInfo.amountPaid >= paymentLinkInfo.amount)
      ) {
        try {
          // Extract transaction data if available
          const transaction =
            paymentLinkInfo.transactions &&
            paymentLinkInfo.transactions.length > 0
              ? paymentLinkInfo.transactions[0]
              : null;

          // Get reservation ID from additionalData if available
          let resId = reservationId;
          try {
            if (!resId && paymentLinkInfo.additionalData) {
              const additionalData = JSON.parse(paymentLinkInfo.additionalData);
              if (additionalData && additionalData.reservationId) {
                resId = additionalData.reservationId;
              }
            }
          } catch (parseError) {
            console.error("Error parsing additionalData:", parseError);
          }

          // Find a user (simplified approach)
          const user = await User.findOne();
          const userId = user ? user.id : 1;

          // Check if payment already exists in database
          const existingPayment = await PaymentInformation.findOne({
            where: { transactionId: orderCode.toString() },
          });

          let payment;

          if (!existingPayment) {
            // Create the payment record directly
            payment = await PaymentInformation.create({
              userId,
              transactionId: orderCode.toString(), // Save order code in transactionId
              paymentMethod: "bank_transfer",
              amount: paymentLinkInfo.amount,
              currency: "VND",
              status: "completed",
              paymentDate: transaction?.transactionDateTime
                ? new Date(transaction.transactionDateTime)
                : new Date(paymentLinkInfo.createdAt),
              paymentDetails: JSON.stringify(paymentLinkInfo),
              notes: transaction?.description || `Thanh toán ${orderCode}`, // Save description in notes
              reservationId: resId || null,
            });

            console.log(
              `Payment information saved for order ${orderCode} from info endpoint`
            );

            // Send payment confirmation email
            try {
              // Get user email
              if (user && user.email) {
                await sendPaymentConfirmationEmail(user.email, {
                  transactionId: orderCode.toString(),
                  amount: paymentLinkInfo.amount,
                  paymentMethod: "bank_transfer",
                  paymentDate: transaction?.transactionDateTime
                    ? new Date(transaction.transactionDateTime)
                    : new Date(paymentLinkInfo.createdAt),
                  status: "completed",
                });
                console.log(`Payment confirmation email sent to ${user.email}`);
              }
            } catch (emailError) {
              console.error(
                "Error sending payment confirmation email:",
                emailError
              );
            }
          } else {
            console.log(
              `Payment for order ${orderCode} already exists in database, skipping`
            );
            payment = existingPayment;
          }

          // If we have a reservation ID, update the reservation status
          if (resId && payment) {
            try {
              // Update payment with reservation ID if not already set
              if (!payment.reservationId) {
                await payment.update({ reservationId: resId });
              }

              // Update reservation status
              const reservation = await Reservation.findByPk(resId);
              if (reservation && reservation.status === "pending") {
                await reservation.update({ status: "confirmed" });
                console.log(
                  `Updated reservation #${resId} status to confirmed`
                );
              }
            } catch (error) {
              console.error("Error updating reservation status:", error);
            }
          }
        } catch (dbError) {
          console.error("Error saving payment from info endpoint:", dbError);
        }
      }

      // Add reservationId to the response if provided
      const responseData = {
        ...paymentLinkInfo,
        reservationId: resId || null,
      };

      res.json({
        success: true,
        data: responseData,
      });
    } catch (payosError) {
      console.error("Error getting payment info from PayOS API:", payosError);

      // Check if this was a valid payment by looking for information in the URL parameters
      // that are sent back from the payment provider
      const isFromCallback =
        req.query.code === "00" || req.query.status === "PAID";

      if (isFromCallback) {
        // If we're coming from a payment provider callback with successful status
        // but can't find the payment in PayOS, create a record based on the URL parameters
        const mockInfo = {
          id: req.query.id || "payment-id",
          orderCode: orderCode,
          amount: 5000, // Default deposit amount
          amountPaid: 5000,
          amountRemaining: 0,
          status: "PAID",
          createdAt: new Date().toISOString(),
          transactions: [
            {
              reference: req.query.id || "transaction",
              amount: 5000,
              description: `Đặt cọc #${orderCode.toString().slice(-6)}`,
              transactionDateTime: new Date().toISOString(),
            },
          ],
        };

        try {
          // Create the payment record
          const payment = await PaymentInformation.create({
            userId: 1, // Default user ID
            transactionId: orderCode.toString(),
            paymentMethod: "bank_transfer",
            amount: mockInfo.amount,
            currency: "VND",
            status: "completed",
            paymentDate: new Date(),
            paymentDetails: JSON.stringify(mockInfo),
            notes: mockInfo.transactions[0].description,
            reservationId: reservationId || null,
          });

          console.log(`Created fallback payment record for order ${orderCode}`);

          // If we have a reservation ID, update its status
          if (reservationId) {
            try {
              const reservation = await Reservation.findByPk(reservationId);
              if (reservation) {
                await reservation.update({ status: "confirmed" });
                console.log(
                  `Updated reservation #${reservationId} status to confirmed`
                );
              }
            } catch (error) {
              console.error("Error updating reservation status:", error);
            }
          }

          return res.json({
            success: true,
            data: {
              ...mockInfo,
              reservationId: reservationId || null,
            },
          });
        } catch (dbError) {
          console.error("Error creating fallback payment record:", dbError);
        }
      }

      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin thanh toán",
      });
    }
  } catch (error) {
    console.error("Error getting payment info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment information",
      error: error.message,
    });
  }
});

// Payment webhook for receiving payment notifications from PayOS
router.post("/webhook", async (req, res) => {
  try {
    // Check if PayOS is properly initialized
    if (!payos) {
      console.warn("PayOS not initialized. Webhook request ignored.");
      return res.status(200).json({ message: "Webhook received" });
    }

    console.log("Received payment webhook from PayOS");
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (webhookData) {
      // Process the payment notification
      console.log("Payment webhook data verified:", webhookData.orderCode);

      // Extract payment information
      const {
        orderCode,
        amount,
        description,
        accountNumber,
        reference,
        transactionDateTime,
        currency,
        paymentLinkId,
        code,
        desc,
        counterAccountBankId,
        counterAccountBankName,
        counterAccountName,
        counterAccountNumber,
      } = webhookData;

      // Parse transaction date
      const paymentDate = new Date(transactionDateTime);

      // Only save successful payments
      if (code === "00" || desc.toLowerCase().includes("thành công")) {
        try {
          // Find the associated user (this is simplified, you might need more logic)
          const user = await User.findOne();
          const userId = user ? user.id : 1; // Default to user ID 1 if no user found

          // Format transaction details for storage
          const paymentDetails = JSON.stringify({
            accountNumber,
            reference,
            counterAccountBankId,
            counterAccountBankName,
            counterAccountName,
            counterAccountNumber,
            paymentLinkId,
          });

          // Check if payment already exists in database
          const existingPayment = await PaymentInformation.findOne({
            where: { transactionId: orderCode.toString() },
          });

          let payment;

          if (!existingPayment) {
            // Save to payment_information table
            payment = await PaymentInformation.create({
              userId,
              transactionId: orderCode.toString(), // Save order code in transactionId as specified
              paymentMethod: "bank_transfer",
              amount: parseFloat(amount),
              currency: currency || "VND",
              status: "completed",
              paymentDate,
              paymentDetails,
              notes: description || `Thanh toán ${orderCode}`, // Save description in notes as specified
            });

            console.log(`Payment information saved for order ${orderCode}`);

            // Send payment confirmation email
            try {
              if (user && user.email) {
                await sendPaymentConfirmationEmail(user.email, {
                  transactionId: orderCode.toString(),
                  amount: parseFloat(amount),
                  paymentMethod: "bank_transfer",
                  paymentDate,
                  status: "completed",
                });
                console.log(
                  `Payment confirmation email sent to ${user.email} for order ${orderCode}`
                );
              }
            } catch (emailError) {
              console.error(
                "Error sending payment confirmation email:",
                emailError
              );
            }
          } else {
            console.log(
              `Payment for order ${orderCode} already exists in database, skipping`
            );
            payment = existingPayment;
          }

          // Check if this payment is associated with a reservation
          // First try to parse additionalData if available
          let reservationId = null;
          try {
            if (webhookData.additionalData) {
              const additionalData = JSON.parse(webhookData.additionalData);
              if (additionalData && additionalData.reservationId) {
                reservationId = parseInt(additionalData.reservationId);
              }
            }
          } catch (parseError) {
            console.error("Error parsing additionalData:", parseError);
          }

          // If not found in additionalData, try to parse from description or order code
          if (!reservationId) {
            const reservationIdMatch = /reservation[=:_-]?(\d+)/i.exec(
              description || orderCode
            );
            reservationId = reservationIdMatch
              ? parseInt(reservationIdMatch[1])
              : null;
          }

          if (reservationId) {
            // Find the reservation
            const reservation = await Reservation.findByPk(reservationId);

            // If found, update status and link payment to reservation
            if (reservation) {
              console.log(
                `Found reservation #${reservationId} for payment ${orderCode}`
              );

              // Update reservation status to confirmed
              await reservation.update({ status: "confirmed" });

              // Link payment to reservation if not already linked
              if (payment && !payment.reservationId) {
                await payment.update({ reservationId });
              }

              console.log(
                `Updated reservation #${reservationId} status to confirmed`
              );
            } else {
              console.log(`No reservation found with ID ${reservationId}`);
            }
          } else {
            console.log(
              `No reservation ID found in payment description: ${
                description || orderCode
              }`
            );
          }
        } catch (dbError) {
          console.error("Error processing payment and reservation:", dbError);
        }
      } else {
        console.log(
          `Payment webhook received but payment not successful. Status: ${code} - ${desc}`
        );
      }

      res.status(200).json({ message: "Webhook received and processed" });
    } else {
      console.warn("Invalid webhook data received");
      res.status(400).json({ message: "Invalid webhook data" });
    }
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    res
      .status(500)
      .json({ message: "Error processing webhook", error: error.message });
  }
});

module.exports = router;
