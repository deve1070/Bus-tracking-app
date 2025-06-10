export interface Station {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
} 