import axios from 'axios';
import {Config} from '@/config';

export interface BookingRequest {
  estateId: string;
  checkIn: string;
  checkOut: string;
  note: string;
  price: number;
  status: string;
}

export interface BookingResponse {
  transaction: {
    _id: string;
    estateId: string;
    userId: string;
    checkIn: string;
    checkOut: string;
    note: string;
    price: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

class BookingService {
  private static instance: BookingService;
  private constructor() {}

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  public async createBooking(
    data: BookingRequest,
    token: string,
  ): Promise<BookingResponse> {
    try {
      const response = await axios.post(
        `${Config.API_URL}/api/rental/request`,
        data,
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getBookingHistory(token: string): Promise<any> {
    try {
      const response = await axios.get(`${Config.API_URL}/api/rental/history`, {
        headers: {Authorization: token},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getBookingDetail(id: string, token: string): Promise<any> {
    try {
      const response = await axios.get(
        `${Config.API_URL}/api/rental/detail/${id}`,
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async cancelBooking(id: string, token: string): Promise<any> {
    try {
      const response = await axios.put(
        `${Config.API_URL}/api/rental/cancel/${id}`,
        {},
        {
          headers: {Authorization: token},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const bookingService = BookingService.getInstance(); 