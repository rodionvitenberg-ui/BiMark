export type ProjectStatus = "LIVE" | "PRESALE" | "FUNDED";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  raised: number;
  target: number;
  pricePerShare: number;
  imageUrl?: string;
}