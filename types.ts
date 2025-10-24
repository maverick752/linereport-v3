export enum Shift {
  A = 'A',
  B = 'B',
  C = 'C',
}

export interface ShiftData {
  id: number;
  date: string;
  shift: Shift;
  unitsProduced: number;
  unitsScrapped: number;
}