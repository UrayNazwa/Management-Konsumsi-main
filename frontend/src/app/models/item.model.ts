export interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  supplier?: string;
}
