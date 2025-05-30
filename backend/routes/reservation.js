const express = require('express');
const router = express.Router();
const { Reservation, User, Restaurant, Table, PaymentInformation } = require('../models');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get user's reservations
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        { 
          model: Restaurant, 
          as: 'restaurant',
          attributes: ['id', 'name', 'address']
        },
        { 
          model: Table, 
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'tableCode'] 
        }
      ],
      order: [
        ['date', 'DESC'],
        ['time', 'ASC']
      ]
    });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin đặt bàn' });
  }
});

// Create a new reservation
router.post('/', authenticate, async (req, res) => {
  try {
    const { restaurantId, tableId, date, time, partySize, notes } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!restaurantId || !date || !time || !partySize) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin để đặt bàn' 
      });
    }
    
    // Check if reservation time is at least 2 hours in the future
    const currentTime = new Date();
    const reservationTime = new Date(`${date}T${time}:00`);
    const timeDifferenceInHours = (reservationTime - currentTime) / (1000 * 60 * 60);
    
    if (timeDifferenceInHours < 2) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian đặt bàn phải ít nhất 2 giờ sau thời gian hiện tại',
        showAsToast: true
      });
    }
    
    // Check if table is specified and available for the requested date and time
    if (tableId) {
      const existingReservation = await Reservation.findOne({
        where: {
          tableId,
          date,
          time,
          status: {
            [Op.notIn]: ['cancelled']
          }
        }
      });
      
      if (existingReservation) {
        return res.status(400).json({
          success: false,
          message: 'Bàn này đã được đặt vào thời gian bạn chọn',
          showAsToast: true
        });
      }
    }
    
    // Create a new reservation always with status "pending" regardless of what's sent in request
    const reservation = await Reservation.create({
      userId,
      restaurantId,
      tableId,
      date,
      time,
      partySize,
      notes,
      status: 'pending' // Always set to pending initially
    });
    
    // Return the created reservation with associated data
    const newReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { 
          model: Restaurant, 
          as: 'restaurant',
          attributes: ['id', 'name', 'address']
        },
        { 
          model: Table, 
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'tableCode'],
          required: false
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công',
      id: reservation.id,
      ...newReservation.toJSON()
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi tạo đặt bàn' 
    });
  }
});

// Update reservation after successful payment
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { reservationId, paymentId } = req.body;
    
    if (!reservationId || !paymentId) {
      return res.status(400).json({
        message: 'Thiếu thông tin xác nhận đặt bàn'
      });
    }
    
    // Find the reservation
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Check payment status
    const payment = await PaymentInformation.findByPk(paymentId);
    if (!payment || payment.status !== 'completed') {
      return res.status(400).json({
        message: 'Thanh toán chưa hoàn tất'
      });
    }
    
    // Link payment to reservation if not already linked
    if (!payment.reservationId) {
      await payment.update({ reservationId });
    }
    
    // Update reservation status to confirmed
    await reservation.update({ status: 'confirmed' });
    
    // Return updated reservation with associated data
    const confirmedReservation = await Reservation.findByPk(reservationId, {
      include: [
        { 
          model: Restaurant, 
          as: 'restaurant',
          attributes: ['id', 'name', 'address']
        },
        { 
          model: Table, 
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'tableCode'] 
        },
        {
          model: PaymentInformation,
          as: 'paymentInformation',
          attributes: ['id', 'amount', 'paymentMethod', 'status', 'paymentDate']
        }
      ]
    });
    
    res.json({
      message: 'Đặt bàn đã được xác nhận thành công',
      reservation: confirmedReservation
    });
  } catch (error) {
    console.error('Error confirming reservation:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xác nhận đặt bàn' });
  }
});

// Cancel reservation
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;
    
    // Find the reservation
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId
      }
    });
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Update reservation status to cancelled
    await reservation.update({ 
      status: 'cancelled',
      notes: reservation.notes ? `${reservation.notes}\n[Lý do hủy: ${reason || 'Không cung cấp'}]` : `[Lý do hủy: ${reason || 'Không cung cấp'}]`
    });
    
    res.json({
      message: 'Đã hủy đặt bàn thành công',
      reservation
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi hủy đặt bàn' });
  }
});

// Update reservation (including cancel)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const { status, reason, notes } = req.body;
    
    // Find the reservation
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId
      }
    });
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (status) updateData.status = status;
    
    // Add reason to notes if cancelling
    if (status === 'cancelled' && reason) {
      updateData.notes = reservation.notes 
        ? `${reservation.notes}\n[Lý do hủy: ${reason}]` 
        : `[Lý do hủy: ${reason}]`;
    } else if (notes) {
      updateData.notes = notes;
    }
    
    // Update reservation
    await reservation.update(updateData);
    
    res.json({
      message: status === 'cancelled' 
        ? 'Đã hủy đặt bàn thành công' 
        : 'Cập nhật đặt bàn thành công',
      reservation
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật đặt bàn' });
  }
});

// DELETE method - Just update status to cancelled, don't actually delete
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const { reason, forceRemoveFromDatabase } = req.body;
    
    // Find the reservation
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId
      }
    });
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Always just update the status to cancelled, never actually delete
    // Ignore the forceRemoveFromDatabase flag to maintain data
    await reservation.update({ 
      status: 'cancelled',
      notes: reservation.notes 
        ? `${reservation.notes}\n[Lý do hủy: ${reason || 'Không cung cấp'}]` 
        : `[Lý do hủy: ${reason || 'Không cung cấp'}]`
    });
    
    res.json({
      message: 'Đã hủy đặt bàn thành công',
      reservation
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi hủy đặt bàn' });
  }
});

// Process refund for cancelled reservation
router.post('/:id/refund', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const { amount, reason } = req.body;
    
    // Find the reservation
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId
      },
      include: [
        {
          model: PaymentInformation,
          as: 'paymentInformation'
        }
      ]
    });
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    // Check if reservation is cancelled - allow both pending and cancelled statuses
    if (reservation.status !== 'cancelled' && reservation.status !== 'pending') {
      return res.status(400).json({
        message: 'Chỉ có thể hoàn tiền cho đặt bàn đã hủy hoặc đang chờ'
      });
    }
    
    // Process refund logic here
    // Normally would integrate with a payment gateway
    // For now we'll just return a success response
    
    // Update payment information if it exists
    if (reservation.paymentInformation && reservation.paymentInformation.length > 0) {
      const payment = reservation.paymentInformation[0];
      await payment.update({
        notes: payment.notes 
          ? `${payment.notes}\n[Hoàn tiền: ${amount}đ, Lý do: ${reason || 'Hủy đặt bàn'}]`
          : `[Hoàn tiền: ${amount}đ, Lý do: ${reason || 'Hủy đặt bàn'}]`
      });
    }
    
    res.json({
      status: 'success',
      message: 'Đã xử lý hoàn tiền thành công',
      refundAmount: amount,
      reservation
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Đã xảy ra lỗi khi xử lý hoàn tiền' 
    });
  }
});

// Get single reservation by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId
      },
      include: [
        { 
          model: Restaurant, 
          as: 'restaurant',
          attributes: ['id', 'name', 'address']
        },
        { 
          model: Table, 
          as: 'table',
          attributes: ['id', 'tableNumber', 'capacity', 'tableCode'] 
        },
        {
          model: PaymentInformation,
          as: 'paymentInformation',
          attributes: ['id', 'amount', 'paymentMethod', 'status', 'paymentDate']
        }
      ]
    });
    
    if (!reservation) {
      return res.status(404).json({
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin đặt bàn' });
  }
});

module.exports = router; 