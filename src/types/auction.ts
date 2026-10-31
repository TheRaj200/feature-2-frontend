export interface Bid {
  _id?: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface Winner {
  bidderName: string | null;
  bidAmount: number;
}

export interface AuctionItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  currentHighestBid: number;
  currentWinner: Winner | null;
  bids: Bid[];
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'ENDED';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
