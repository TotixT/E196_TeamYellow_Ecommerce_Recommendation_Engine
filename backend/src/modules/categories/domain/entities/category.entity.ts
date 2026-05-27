// Domain entity — NO framework imports allowed here (EIE-019)

export enum CategoryStatus {
  active = 'active',
  inactive = 'inactive',
}

export class Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}
