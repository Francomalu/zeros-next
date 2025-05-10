// Define the Vehicle interface
export interface Service {
  ServiceId: 0;
  Name: string;
  OrigenId: number;
  OriginName: string;
  DestinationId: number;
  DestinationName: string;
  StartDate: string;
  EndDate: string;
  EstimatedDuration: string;
  DepartureHour: string;
  IsHoliday: true;
  Vehicle: {
    internalNumber: string;
    availableQuantity: 0;
    fullQuantity: 0;
    vehicleTypeName: string;
    image: string;
    vehicleId: number;
  };
  Status: string;
}