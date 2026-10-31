import type { ApiResponse, AuctionItem } from '../types/auction';

const backendUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api/auction` : '/api/auction';

export const api = {
  async getAuction(): Promise<AuctionItem> {
    const res = await fetch(API_BASE);
    const json: ApiResponse<AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch auction item');
    }
    return json.data;
  },

  async placeBid(auctionId: string, bidderName: string, amount: number): Promise<AuctionItem> {
    const res = await fetch(`${API_BASE}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auctionId, bidderName, amount }),
    });
    const json: ApiResponse<AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Bid rejected');
    }
    return json.data;
  },

  async resetAuction(params: {
    durationMinutes?: number;
    startingPrice?: number;
    title?: string;
    description?: string;
    imageUrl?: string;
  }): Promise<AuctionItem> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const json: ApiResponse<AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to reset auction');
    }
    return json.data;
  },
};
