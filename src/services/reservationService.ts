// In src/services/reservationService.ts

import { Room } from '../models/room';

interface Reservation {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  expiresAt: Date;
}

let reservations: Reservation[] = [];

export const createReservation = (roomId: string, checkInDate: Date, checkOutDate: Date): Reservation => {
  const reservation: Reservation = {
    roomId,
    checkInDate,
    checkOutDate,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Expires in 15 minutes
  };
  reservations.push(reservation);
  return reservation;
};

export const removeExpiredReservations = () => {
  const now = new Date();
  reservations = reservations.filter(reservation => reservation.expiresAt > now);
};

export const isRoomReserved = (roomId: string, checkInDate: Date, checkOutDate: Date): boolean => {
  removeExpiredReservations();
  return reservations.some(reservation =>
    reservation.roomId === roomId &&
    (
      (checkInDate >= reservation.checkInDate && checkInDate < reservation.checkOutDate) ||
      (checkOutDate > reservation.checkInDate && checkOutDate <= reservation.checkOutDate) ||
      (checkInDate <= reservation.checkInDate && checkOutDate >= reservation.checkOutDate)
    )
  );
};
