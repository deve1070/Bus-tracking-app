import axios from 'axios';
import { config } from '../config';

export class PaymentService {
  private static readonly CHAPA_API_URL = 'https://api.chapa.co/v1';
  private static readonly CHAPA_API_KEY = config.chapa.apiKey;

  /**
   * Initialize a payment transaction
   */
  static async initializePayment(data: {
    amount: number;
    currency: string;
    email: string;
    firstName: string;
    lastName: string;
    tx_ref: string;
    callback_url: string;
    return_url: string;
  }) {
    try {
      const response = await axios.post(
        `${this.CHAPA_API_URL}/transaction/initialize`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${this.CHAPA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(tx_ref: string) {
    try {
      const response = await axios.get(
        `${this.CHAPA_API_URL}/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.CHAPA_API_KEY}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for payment
   */
  static async generateQRCode(data: {
    amount: number;
    currency: string;
    tx_ref: string;
  }) {
    try {
      const response = await axios.post(
        `${this.CHAPA_API_URL}/qr-code`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.CHAPA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
} 