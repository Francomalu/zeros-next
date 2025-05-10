'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Bus, Edit, Plus, Search, Trash, TruckIcon, UserPlusIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteLogic, get, post, put } from '@/services/api';
import { PageHeader } from '@/components/dashboard/page-header';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { SearchFilter } from '@/components/dashboard/search-filter';
import { StatusFilter } from '@/components/dashboard/status-filter';
import { DashboardTable } from '@/components/dashboard/dashboard-table';
import { TablePagination } from '@/components/dashboard/table-pagination';
import { MobileCard } from '@/components/dashboard/mobile-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { FormDialog } from '@/components/dashboard/form-dialog';
import { FormField } from '@/components/dashboard/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteDialog } from '@/components/dashboard/delete-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormReducer } from '@/hooks/use-form-reducer';
import { toast } from '@/hooks/use-toast';
import { PagedResponse } from '@/services/types';
import { VehicleType } from '@/interfaces/vehicleType';

const initialVehicleTypeForm = {
  name: '',
  quantity: 0,
};

export default function VehicleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Separate state for current page to avoid double fetching
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentVehicleTypeId, setCurrentVehicleTypeId] = useState<number | null>(null);
  const addForm = useFormReducer(initialVehicleTypeForm);

  // Form state for editing a vehicle
  const editForm = useFormReducer(initialVehicleTypeForm);

  // State for the paged response
  const [vehiclesTypesData, setVehiclesTypesData] = useState<PagedResponse<VehicleType>>({
    Items: [],
    PageNumber: 1,
    PageSize: 8,
    TotalRecords: 0,
    TotalPages: 0,
  });
  // Function to fetch vehicles data
  const fetchVehicles = async (pageToFetch = currentPage, pageSizeToFetch = pageSize) => {
    setIsLoading(true);
    try {
      const response = await get<any, VehicleType>('/vehicle-type-report', {
        pageNumber: pageToFetch,
        pageSize: pageSizeToFetch,
        sortBy: 'fecha',
        sortDescending: true,
        filters: searchQuery
          ? {
              search: searchQuery,
            }
          : {},
      });
      setVehiclesTypesData(response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Fetch vehicles when search changes or on initial load
  useEffect(() => {
    fetchVehicles(currentPage, pageSize);
  }, [searchQuery, pageSize, currentPage]);

  const submitAddVehicle = async () => {
    addForm.setLoading(true);
    try {
      const response = await post('/vehicle-type-create', addForm.state.data);
      if (response) {
        toast({
          title: 'Vehículo creado',
          description: 'El vehículo ha sido creado exitosamente',
          variant: 'success',
        });
        setIsAddModalOpen(false);
        fetchVehicles(); // Refresh the vehicle list
      } else {
        addForm.setError('Error al crear el vehículo');
        toast({
          title: 'Error',
          description: 'Error al crear el vehículo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addForm.setError('Ocurrió un error al crear el vehículo');
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear el vehículo',
        variant: 'destructive',
      });
    } finally {
      addForm.setLoading(false);
    }
  };

  const submitEditVehicle = async () => {
    editForm.setLoading(true);
    try {
      const response = await put(`/vehicle-type-update/${currentVehicleTypeId}`, editForm.state.data);
      if (response) {
        toast({
          title: 'Vehículo editado',
          description: 'El vehículo ha sido editado exitosamente',
          variant: 'success',
        });
        setIsEditModalOpen(false);
        fetchVehicles(); // Refresh the vehicle list
      } else {
        addForm.setError('Error al editar el vehículo');
        toast({
          title: 'Error',
          description: 'Error al editar el vehículo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addForm.setError('Ocurrió un error al editar el vehículo');
      toast({
        title: 'Error',
        description: 'Ocurrió un error al editar el vehículo',
        variant: 'destructive',
      });
    } finally {
      addForm.setLoading(false);
    }
  };

  const handleEditVehicle = (vehicle: VehicleType) => {
    setCurrentVehicleTypeId(vehicle.VehicleTypeId);
    editForm.setForm({
      name: vehicle.Name,
      quantity: vehicle.Quantity,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteVehicle = (id: number) => {
    setCurrentVehicleTypeId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const id = await deleteLogic(`/vehicle-delete/${currentVehicleTypeId}`);
    // In a real app, you would delete the vehicle from the database
    setIsDeleteModalOpen(false);
    setCurrentVehicleTypeId(null);
    fetchVehicles();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const columns = [
    { header: 'Nombre', accessor: 'Name', width: '40%' },
    { header: 'Cantidad', accessor: 'Quantity', width: '15%' },
    {
      header: 'Estado',
      accessor: 'status',
      className: 'text-center',
      width: '20%',
      cell: (vehicle: VehicleType) => <StatusBadge status={vehicle.status} />,
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      className: 'text-right',
      width: '25%',
      cell: (vehicle: VehicleType) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => handleEditVehicle(vehicle)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleDeleteVehicle(vehicle.VehicleTypeId)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Vehiculos"
        description="Gestiona y visualiza toda la información de los tipos de vehiculos"
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <TruckIcon className="mr-2 h-4 w-4" />
            Añadir Tipo de Vehiculo
          </Button>
        }
      />

      <Card className="w-full">
        <CardContent className="pt-6 w-full">
          <div className="space-y-4 w-full">
            <FilterBar onReset={resetFilters}>
              <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por nombre..." />
            </FilterBar>

            <div className="hidden md:block w-full">
              <DashboardTable
                columns={columns}
                data={vehiclesTypesData.Items}
                emptyMessage="No se encontraron vehiculos."
                isLoading={isLoading}
                skeletonRows={vehiclesTypesData.PageSize}
              />
            </div>

            {vehiclesTypesData.Items.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={vehiclesTypesData.TotalPages}
                totalItems={vehiclesTypesData.TotalRecords}
                itemsPerPage={vehiclesTypesData.PageSize}
                onPageChange={setCurrentPage}
                itemName="vehiculos"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4 mt-4">
        {isLoading ? (
          // Mobile skeleton loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-card-${index}`} className="w-full">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, fieldIndex) => (
                    <div key={`skeleton-field-${fieldIndex}`}>
                      <Skeleton className="h-4 w-[80px] mb-1" />
                      <Skeleton className="h-5 w-[120px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : vehiclesTypesData.Items.length > 0 ? (
          vehiclesTypesData.Items.map((vehicle) => (
            <MobileCard
              key={vehicle.VehicleTypeId}
              title={vehicle.Name}
              subtitle={vehicle.VehicleTypeId.toString()}
              badge={<StatusBadge status={vehicle.status ? 'Activo' : 'Inactivo'} />}
              fields={[{ label: 'Cantidad', value: vehicle.Quantity }]}
              onEdit={() => handleEditVehicle(vehicle)}
              onDelete={() => handleDeleteVehicle(vehicle.VehicleTypeId)}
            />
          ))
        ) : (
          <div className="text-center p-4 border rounded-md">No se encontraron tipos de vehiculos.</div>
        )}
      </div>

      {/* Add Customer Modal */}
      <FormDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Añadir nuevo tipo de vehiculo"
        description="Crea un nuevo tipo de vehiculo completando el formulario a continuación."
        onSubmit={() => submitAddVehicle()}
        submitText="Crear Vehiculo"
      >
        <FormField label="Nombre">
          <Input
            id="name"
            placeholder="Nombre"
            value={addForm.state.data.name}
            onChange={(e) => addForm.setField('name', e.target.value)}
          />
        </FormField>
        <FormField label="Capacidad">
          <Input
            id="quantity"
            placeholder="Capacidad"
            value={addForm.state.data.quantity}
            onChange={(e) => addForm.setField('quantity', Number(e.target.value))}
          />
        </FormField>
      </FormDialog>

      {/* Edit Customer Modal */}
      <FormDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar tipo de vehículo"
        description="Realiza cambios en los detalles del tipo de vehículo a continuación."
        onSubmit={() => submitEditVehicle()}
        submitText="Guardar Cambios"
      >
        <FormField label="Nombre">
          <Input
            id="edit-name"
            value={editForm.state.data.name}
            onChange={(e) => editForm.setField('name', e.target.value)}
          />
        </FormField>
        <FormField label="Capacidad">
          <Input
            id="edit-capacidad"
            value={editForm.state.data.quantity}
            onChange={(e) => editForm.setField('quantity', Number(e.target.value))}
          />
        </FormField>
      </FormDialog>

      {/* Delete Confirmation Modal */}
      <DeleteDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
        description="Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente y todos los datos asociados de nuestros servidores."
      />
    </div>
  );
}
