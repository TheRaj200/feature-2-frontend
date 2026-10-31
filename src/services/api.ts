import type { ApiResponse, AuctionItem } from '../types/auction';

const defaultLiveUrl = 'https://feature-2-backend-jcws.onrender.com';
const backendUrl =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : defaultLiveUrl);
const API_BASE = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api/auction` : '/api/auction';

export const api = {
  async getAllAuctions(): Promise<AuctionItem[]> {
    const res = await fetch(API_BASE);
    const json: ApiResponse<AuctionItem[] | AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch auctions');
    }
    return Array.isArray(json.data) ? json.data : [json.data];
  },

  async getAuction(id?: string): Promise<AuctionItem> {
    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const res = await fetch(url);
    const json: ApiResponse<AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch auction item');
    }
    const data = json.data as any;
    return Array.isArray(data) ? data[0] : data;
  },

  async createAuction(params: {
    title: string;
    description?: string;
    imageUrl?: string;
    startingPrice: number;
    durationMinutes: number;
    creatorName?: string;
  }): Promise<AuctionItem> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    const json: ApiResponse<AuctionItem> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to create auction');
    }
    return json.data;
  },

  async placeBid(auctionId: string, bidderName: string, amount: number): Promise<AuctionItem> {
    const res = await fetch(`${API_BASE}/${auctionId}/bid`, {
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
    auctionId?: string;
    durationMinutes?: number;
    startingPrice?: number;
    title?: string;
    description?: string;
    imageUrl?: string;
  }): Promise<AuctionItem> {
    const url = params.auctionId ? `${API_BASE}/${params.auctionId}/reset` : `${API_BASE}/reset`;
    const res = await fetch(url, {
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
