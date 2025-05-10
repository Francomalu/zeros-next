'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Bus, Edit, Plus, Search, Trash, TruckIcon, UserPlusIcon, Wrench } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteLogic, get, post, put } from '@/services/api';
import { PageHeader } from '@/components/dashboard/page-header';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { SearchFilter } from '@/components/dashboard/search-filter';
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
import { Service } from '@/interfaces/service';
import { ApiSelect, SelectOption } from '@/components/dashboard/select';
import { City } from '@/interfaces/city';
import { Vehicle } from '@/interfaces/vehicle';

const initialService = {
  name: '',
  origenId: 0,
  destinationId: 0,
  estimatedDuration: '',
  departureHour: '',
  isHoliday: false,
  vehicleId: 0,
};

export default function ServiceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Separate state for current page to avoid double fetching
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const addForm = useFormReducer(initialService);
  const editForm = useFormReducer(initialService);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // State for the paged response
  const [servicesData, setServicesData] = useState<PagedResponse<Service>>({
    Items: [],
    PageNumber: 1,
    PageSize: 8,
    TotalRecords: 0,
    TotalPages: 0,
  });
  // Function to fetch vehicles data
  const fetchServices = async (pageToFetch = currentPage, pageSizeToFetch = pageSize) => {
    setIsLoading(true);
    try {
      const response = await get<any, Service>('/service-report', {
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
      setServicesData(response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Fetch vehicles when search changes or on initial load
  useEffect(() => {
    fetchServices(currentPage, pageSize);
  }, [searchQuery, pageSize, currentPage]);

  const loadAllOptions = async () => {
    try {
      setIsOptionsLoading(true);
      setOptionsError(null);

      // Llamadas API (pueden ir en paralelo)
      const [cityResponse, vehicleResponse] = await Promise.all([
        get<any, City>('/city-report', {
          pageNumber: 1,
          pageSize: 10,
          sortBy: 'fecha',
          sortDescending: true,
          filters: searchQuery ? { search: searchQuery } : {},
        }),
        get<any, Vehicle>('/vehicle-report', {
          pageNumber: 1,
          pageSize: 10,
          sortBy: 'fecha',
          sortDescending: true,
          filters: searchQuery ? { search: searchQuery } : {},
        }),
      ]);

      // Cargar ciudades
      if (cityResponse) {
        const formattedCities = cityResponse.Items.map((city: City) => ({
          id: city.CityId.toString(),
          value: city.CityId.toString(),
          label: city.Name,
        }));
        setCities(formattedCities);
      }

      // Cargar vehículos
      if (vehicleResponse) {
        const formattedVehicles = vehicleResponse.Items.map((vehicle: Vehicle) => ({
          id: vehicle.VehicleTypeId.toString(),
          value: vehicle.VehicleTypeId.toString(),
          label: vehicle.VehicleTypeName + vehicle.InternalNumber,
        }));
        setVehicles(formattedVehicles);
      }
    } catch (error) {
      setOptionsError('Error al cargar las ciudades o los tipos de vehículos');
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const submitAddService = async () => {
    addForm.setLoading(true);
    try {
      const response = await post('/service-create', addForm.state.data);
      if (response) {
        toast({
          title: 'Servicio creado',
          description: 'El servicio ha sido creado exitosamente',
          variant: 'success',
        });
        setIsAddModalOpen(false);
        fetchServices(); // Refresh the vehicle list
      } else {
        addForm.setError('Error al crear el servicio');
        toast({
          title: 'Error',
          description: 'Error al crear el servicio',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addForm.setError('Ocurrió un error al crear el servicio');
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear el servicio',
        variant: 'destructive',
      });
    } finally {
      addForm.setLoading(false);
    }
  };

  const submitEditService = async () => {
    editForm.setLoading(true);
    try {
      const response = await put(`/service-update/${currentServiceId}`, editForm.state.data);
      if (response) {
        toast({
          title: 'Servicio editado',
          description: 'El servicio ha sido editado exitosamente',
          variant: 'success',
        });
        setIsEditModalOpen(false);
        fetchServices(); // Refresh the vehicle list
      } else {
        addForm.setError('Error al editar el servicio');
        toast({
          title: 'Error',
          description: 'Error al editar el servicio',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addForm.setError('Ocurrió un error al editar el servicio');
      toast({
        title: 'Error',
        description: 'Ocurrió un error al editar el servicio',
        variant: 'destructive',
      });
    } finally {
      addForm.setLoading(false);
    }
  };

  const handleAddService = () => {
    setCurrentServiceId(null);
    addForm.setForm(initialService);
    setIsAddModalOpen(true);
    loadAllOptions();
  };

  const handleEditService = (service: Service) => {
    setCurrentServiceId(service.ServiceId);
    editForm.setForm({
      name: service.Name,
      origenId: service.OrigenId,
      destinationId: service.DestinationId,
      estimatedDuration: service.EstimatedDuration,
      departureHour: service.DepartureHour,
      isHoliday: service.IsHoliday,
      vehicleId: service.Vehicle.vehicleId,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteService = (id: number) => {
    setCurrentServiceId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const id = await deleteLogic(`/service-delete/${currentServiceId}`);
    setIsDeleteModalOpen(false);
    setCurrentServiceId(null);
    fetchServices();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const columns = [
    { header: 'Nombre', accessor: 'Name', width: '15%' },
    { header: 'Origen', accessor: 'OriginName', width: '20%' },
    { header: 'Destino', accessor: 'DestinationName', width: '20%' },
    { header: 'Duración Estimada', accessor: 'EstimatedDuration', width: '20%' },
    { header: 'Hora de partida', accessor: 'DepartureHour', width: '20%' },
    {
      header: 'Estado',
      accessor: 'status',
      className: 'text-center',
      width: '20%',
      cell: (service: Service) => <StatusBadge status={service.Status} />,
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      className: 'text-right',
      width: '25%',
      cell: (service: Service) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => handleEditService(service)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleDeleteService(service.ServiceId)}
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
        title="Servicios"
        description="Gestiona y visualiza toda la información de los servicios."
        action={
          <Button onClick={() => handleAddService()}>
            <Wrench className="mr-2 h-4 w-4" />
            Añadir Servicio
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
                data={servicesData.Items}
                emptyMessage="No se encontraron servicios."
                isLoading={isLoading}
                skeletonRows={servicesData.PageSize}
              />
            </div>

            {servicesData.Items.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={servicesData.TotalPages}
                totalItems={servicesData.TotalRecords}
                itemsPerPage={servicesData.PageSize}
                onPageChange={setCurrentPage}
                itemName="servicios"
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
        ) : servicesData.Items.length > 0 ? (
          servicesData.Items.map((service) => (
            <MobileCard
              key={service.ServiceId}
              title={service.Name}
              subtitle={service.ServiceId.toString()}
              badge={<StatusBadge status={service.Status ? 'Activo' : 'Inactivo'} />}
              fields={[
                { label: 'Origen', value: service.OriginName },
                { label: 'Destino', value: service.DestinationName },
                { label: 'Duración Estimada', value: service.EstimatedDuration },
                { label: 'Hora de Partida', value: service.DepartureHour },
              ]}
              onEdit={() => handleEditService(service)}
              onDelete={() => handleDeleteService(service.ServiceId)}
            />
          ))
        ) : (
          <div className="text-center p-4 border rounded-md">No se encontraron servicios.</div>
        )}
      </div>

      {/* Add Customer Modal */}
      <FormDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Añadir nuevo servicio"
        description="Crea un nuevo servicio completando el formulario a continuación."
        onSubmit={() => submitAddService()}
        submitText="Crear Servicio"
      >
        <FormField label="Nombre">
          <Input
            id="name"
            placeholder="Nombre"
            value={addForm.state.data.name}
            onChange={(e) => addForm.setField('name', e.target.value)}
          />
        </FormField>
        <FormField label="Origen">
          <ApiSelect
            value={String(addForm.state.data.origenId)}
            onValueChange={(value) => addForm.setField('origenId', Number(value))}
            placeholder="Seleccionar origen"
            options={cities}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando ciudades..."
            errorMessage="Error al cargar las ciudades"
            emptyMessage="No hay ciudades disponibles"
          />
        </FormField>
        <FormField label="Destino">
          <ApiSelect
            value={String(addForm.state.data.destinationId)}
            onValueChange={(value) => addForm.setField('destinationId', Number(value))}
            placeholder="Seleccionar destino"
            options={cities.filter((city) => city.id !== String(addForm.state.data.origenId))}
            disabled={addForm.state.data.origenId === 0}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando destinos..."
            errorMessage="Error al cargar los destinos"
            emptyMessage="No hay destinos disponibles"
          />
        </FormField>
        <FormField label="Dia Inicio">
          <Select onValueChange={(value) => addForm.setField('startDay', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar Día" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miercoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="0">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Dia Fin">
          <Select onValueChange={(value) => addForm.setField('endDate', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar Día" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miercoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="0">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Duración Estimada">
          <Input
            id="estimatedDuration"
            placeholder="Duración Estimada"
            value={addForm.state.data.estimatedDuration}
            onChange={(e) => addForm.setField('estimatedDuration', e.target.value)}
          />
        </FormField>
        <FormField label="Hora de Partida">
          <Input
            id="departureHour"
            placeholder="Hora de Partida"
            value={addForm.state.data.departureHour}
            onChange={(e) => addForm.setField('departureHour', e.target.value)}
          />
        </FormField>
        <FormField label="Feriado">
          <Select onValueChange={(value) => addForm.setField('isHoliday', value === 'true')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Vehículo">
          <ApiSelect
            value={String(addForm.state.data.vehicleId)}
            onValueChange={(value) => addForm.setField('vehicleId', Number(value))}
            placeholder="Seleccionar vehículo"
            options={vehicles}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando vehiculos..."
            errorMessage="Error al cargar los vehículos"
            emptyMessage="No hay vehículos disponibles"
          />
        </FormField>
      </FormDialog>

      {/* Edit Customer Modal */}
      <FormDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Editar servicio"
        description="Realiza cambios en los detalles del servicio a continuación."
        onSubmit={() => submitEditService()}
        submitText="Guardar Cambios"
      >
        <FormField label="Nombre">
          <Input
            id="edit-name"
            value={editForm.state.data.name}
            onChange={(e) => editForm.setField('name', e.target.value)}
          />
        </FormField>
        <FormField label="Origen">
          <ApiSelect
            value={String(editForm.state.data.origenId)}
            onValueChange={(value) => editForm.setField('origenId', Number(value))}
            placeholder="Seleccionar origen"
            options={cities}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando ciudades..."
            errorMessage="Error al cargar las ciudades"
            emptyMessage="No hay ciudades disponibles"
          />
        </FormField>
        <FormField label="Destino">
          <ApiSelect
            value={String(editForm.state.data.destinationId)}
            onValueChange={(value) => editForm.setField('destinationId', Number(value))}
            placeholder="Seleccionar destino"
            options={cities.filter((city) => city.id !== String(editForm.state.data.origenId))}
            disabled={editForm.state.data.origenId === 0}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando destinos..."
            errorMessage="Error al cargar los destinos"
            emptyMessage="No hay destinos disponibles"
          />
        </FormField>
        <FormField label="Dia Inicio">
          <Select onValueChange={(value) => editForm.setField('startDay', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar Día" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miercoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="0">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Dia Fin">
          <Select onValueChange={(value) => editForm.setField('endDate', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar Día" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Lunes</SelectItem>
              <SelectItem value="2">Martes</SelectItem>
              <SelectItem value="3">Miercoles</SelectItem>
              <SelectItem value="4">Jueves</SelectItem>
              <SelectItem value="5">Viernes</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="0">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Duración Estimada">
          <Input
            id="edit-estimatedDuration"
            value={editForm.state.data.estimatedDuration}
            onChange={(e) => editForm.setField('estimatedDuration', e.target.value)}
          />
        </FormField>
        <FormField label="Hora de Partida">
          <Input
            id="edit-departureHour"
            value={editForm.state.data.departureHour}
            onChange={(e) => editForm.setField('departureHour', e.target.value)}
          />
        </FormField>
        <FormField label="Feriado">
          <Select onValueChange={(value) => editForm.setField('isHoliday', value === 'true')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Vehículo">
          <ApiSelect
            value={String(editForm.state.data.vehicleId)}
            onValueChange={(value) => editForm.setField('vehicleId', Number(value))}
            placeholder="Seleccionar vehículo"
            options={vehicles}
            loading={isOptionsLoading}
            error={optionsError}
            loadingMessage="Cargando vehiculos..."
            errorMessage="Error al cargar los vehículos"
            emptyMessage="No hay vehículos disponibles"
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
