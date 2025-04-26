'use client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { get, post } from '@/services/api';
import { Dialog } from '@radix-ui/react-dialog';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Bus, Edit, Plus, Search, Trash } from 'lucide-react';
import { NextRequest } from 'next/server'; // Necesitamos esto si estás usando App Directory
import { useEffect, useState } from 'react';

type Vehicle = {
  VehicleId: number;
  VehicleTypeId: number;
  InternalNumber: string;
  VehicleTypeName: string;
  VehicleTypeQuantity: number;
  Status: boolean;
};

export default function Drivers(req: NextRequest) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    VehicleId: 0,
    VehicleTypeId: 0,
    InternalNumber: '',
    VehicleTypeName: '',
    VehicleTypeQuantity: 0,
    Status: true,
  });

  const fetchVehicles = async (pageToFetch = page) => {
    const response = await get<any, Vehicle>('/vehicle-report', {
      pageNumber: pageToFetch,
      pageSize: 10,
      sortBy: 'fecha',
      sortDescending: true,
      filters: {},
    });
    setVehicles(response.Items);
  };

  useEffect(() => {
    fetchVehicles();
  }, [page]);

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.VehicleTypeName.toLowerCase().includes(searchQuery.toLowerCase()) || vehicle.InternalNumber.toString().includes(searchQuery.toString())
  );

  const vehicleTypes = [
    { id: 1, name: 'Minibus', quantity: 12 },
    { id: 2, name: 'Bus Estándar', quantity: 40 },
    { id: 3, name: 'Bus Premium', quantity: 32 },
  ];

  // Handle vehicle deletion
  const handleDeleteVehicle = (vehicle: any) => {
    setVehicleToDelete(vehicle);
  };

  const confirmDeleteVehicle = () => {
    if (vehicleToDelete) {
      setVehicles(vehicles.filter((v) => v.VehicleId !== vehicleToDelete.id));
      setVehicleToDelete(null);
    }
  };

  // Handle vehicle editing
  const handleEditVehicle = (vehicle: any) => {};

  // Handle adding new vehicle
  const handleAddVehicle = async () => {
    await post<Vehicle>('/vehicle-create', newVehicle);
    setIsAddVehicleDialogOpen(false);
    fetchVehicles(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 font-display">Coches</h1>
          <p className="text-gray-600 mt-2">Gestión de vehículos de la flota.</p>
        </div>
        <Button onClick={() => setIsAddVehicleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Coche
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              <span>Lista de Coches</span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar coche..."
                className="pl-8"
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No hay coches registrados.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="min-w-full">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 mb-2 px-3 py-2 bg-gray-100 rounded-md text-sm font-medium">
                  <div className="col-span-5">Tipo</div>
                  <div className="col-span-2">Código</div>
                  <div className="col-span-2">Capacidad</div>
                  <div className="col-span-1">Estado</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>

                {/* Table rows */}
                <div className="space-y-2">
                  {vehicles?.map((vehicle) => (
                    <div key={vehicle.VehicleId} className={`border rounded-lg p-3 transition-colors grid grid-cols-12 gap-4 items-center`}>
                      <div className="col-span-5">{vehicle.VehicleTypeName}</div>
                      <div className="col-span-2">{vehicle.InternalNumber}</div>
                      <div className="col-span-2">{vehicle.VehicleTypeQuantity}</div>
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={vehicle.Status}
                            // onCheckedChange={(checked) => handleVehicleStatusToggle(vehicle.id, checked)}
                          />
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                          // onClick={() => handleEditVehicle(vehicle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                          // onClick={() => handleDeleteVehicle(vehicle)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Vehicle Confirmation Dialog */}
      {/* <AlertDialog open={!!vehicleToDelete} onOpenChange={() => setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el vehículo <strong>{vehicleToDelete?.name}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteVehicle}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* Edit Vehicle Dialog */}
      {/* <Dialog open={!!vehicleToEdit} onOpenChange={() => setVehicleToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>Modifique los datos del vehículo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-vehicle-name">Nombre</Label>
              <Input
                id="edit-vehicle-name"
                value={editedVehicle.name}
                onChange={(e) => setEditedVehicle({ ...editedVehicle, name: e.target.value })}
                placeholder="Nombre del vehículo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vehicle-type">Tipo de Vehículo</Label>
              <Select
                value={editedVehicle.typeId}
                onValueChange={(value) => setEditedVehicle({ ...editedVehicle, typeId: value })}
              >
                <SelectTrigger id="edit-vehicle-type">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.quantity} pasajeros)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleToEdit(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmEditVehicle}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Vehículo</DialogTitle>
            <DialogDescription>Complete los datos para registrar un nuevo vehículo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Tipo de Vehículo</Label>
              <Select
                value={newVehicle?.VehicleTypeId.toString() ?? ''} // Usamos "" por si es null
                onValueChange={(value) => {
                  if (newVehicle) {
                    setNewVehicle({ ...newVehicle, VehicleTypeId: Number(value) });
                  }
                }}
              >
                <SelectTrigger id="vehicle-type">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name} ({type.quantity} pasajeros)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-quantity">Numero interno</Label>
              <Input
                id="number-internal"
                type="number"
                value={newVehicle.InternalNumber}
                onChange={(e) => setNewVehicle({ ...newVehicle, InternalNumber: e.target.value })}
                placeholder="Numero de interno"
                min="1"
                max="999999"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVehicleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddVehicle}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
