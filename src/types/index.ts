export interface CardType {
  _id: string;
  title: string;
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AudioType {
  _id: string;
  name: string;
  src: string;
  createdAt?: string;
  updatedAt?: string;
}
