'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Bus, Edit, Plus, Search, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { get } from '@/services/api';

// Define the PagedResponse interface
export interface PagedResponse<T = any> {
  Items: T[];
  PageNumber: number;
  PageSize: number;
  TotalRecords: number;
  TotalPages: number;
}

// Define the Vehicle interface
interface Vehicle {
  VehicleId: number;
  VehicleTypeName: string;
  InternalNumber: string;
  VehicleTypeQuantity: number;
  Status: boolean;
}

export default function VehicleManagement() {
  const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Separate state for current page to avoid double fetching
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // State for the paged response
  const [vehiclesData, setVehiclesData] = useState<PagedResponse<Vehicle>>({
    Items: [],
    PageNumber: 1,
    PageSize: 5,
    TotalRecords: 0,
    TotalPages: 0,
  });

  // Ref to track if search has changed
  const searchChanged = useRef(false);

  // Function to fetch vehicles data
  const fetchVehicles = async (pageToFetch = currentPage, pageSizeToFetch = pageSize) => {
    if (isLoading) return; // Prevent multiple simultaneous requests

    setIsLoading(true);

    try {
      const response = await get<any, Vehicle>('/vehicle-report', {
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
      setVehiclesData(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setIsLoading(false);
    }
  };

  // Fetch vehicles when search changes or on initial load
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // When search changes, reset to page 1
      if (searchChanged.current) {
        fetchVehicles(1, pageSize);
        searchChanged.current = false;
      } else {
        // Initial load
        fetchVehicles();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pageSize]); // Remove currentPage from dependencies

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchVehicles(page, pageSize);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchVehicles(newPage, pageSize);
    }
  };

  const handleNext = () => {
    if (currentPage < vehiclesData.TotalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchVehicles(newPage, pageSize);
    }
  };

  // Search handler with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    searchChanged.current = true;
    // The actual search is triggered by the useEffect
  };

  // Mock handlers for vehicle actions
  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log('Edit vehicle:', vehicle);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    console.log('Delete vehicle:', vehicle);
  };

  const handleVehicleStatusToggle = (id: number, status: boolean) => {
    console.log('Toggle status for vehicle ID:', id, 'New status:', status);
  };

  // Calculate display range for pagination info
  const startItem = (vehiclesData.PageNumber - 1) * vehiclesData.PageSize + 1;
  const endItem = Math.min(startItem + vehiclesData.Items.length - 1, vehiclesData.TotalRecords);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 font-display">Vehículos</h1>
          <p className="text-gray-600 mt-2">Gestión de vehículos de la flota.</p>
        </div>
        <Button onClick={() => setIsAddVehicleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Coche
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              <span>Lista de Vehículos</span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Buscar coche..." className="pl-8" value={searchQuery} onChange={handleSearchChange} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vehiclesData.Items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No hay coches registrados.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[40%]">Tipo</TableHead>
                    <TableHead className="w-[15%]">Código</TableHead>
                    <TableHead className="w-[15%]">Capacidad</TableHead>
                    <TableHead className="w-[10%]">Estado</TableHead>
                    <TableHead className="w-[20%] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclesData.Items.map((vehicle) => (
                    <TableRow key={vehicle.VehicleId} className={cn('transition-colors hover:bg-gray-50', !vehicle.Status && 'bg-gray-50/50')}>
                      <TableCell className="font-medium">{vehicle.VehicleTypeName}</TableCell>
                      <TableCell>{vehicle.InternalNumber}</TableCell>
                      <TableCell>{vehicle.VehicleTypeQuantity}</TableCell>
                      <TableCell>
                        <Switch checked={vehicle.Status} onCheckedChange={(checked) => handleVehicleStatusToggle(vehicle.VehicleId, checked)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleEditVehicle(vehicle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteVehicle(vehicle)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {vehiclesData.Items.length > 0 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-gray-500">
              Mostrando {startItem}-{endItem} de {vehiclesData.TotalRecords} vehículos
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevious} className={cn(currentPage === 1 && 'pointer-events-none opacity-50')} />
                </PaginationItem>

                {/* Generate page links */}
                {Array.from({ length: Math.min(vehiclesData.TotalPages, 5) }).map((_, index) => {
                  // Logic to show pages around current page
                  let pageToShow = index + 1;

                  if (vehiclesData.TotalPages > 5 && currentPage > 3) {
                    if (index === 0) {
                      pageToShow = 1;
                    } else if (index === 1 && currentPage > 4) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    } else {
                      pageToShow = Math.min(currentPage + index - 2, vehiclesData.TotalPages);
                    }
                  }

                  if (pageToShow <= vehiclesData.TotalPages) {
                    return (
                      <PaginationItem key={index}>
                        <PaginationLink onClick={() => handlePageChange(pageToShow)} isActive={currentPage === pageToShow}>
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {/* Show ellipsis if there are more pages */}
                {vehiclesData.TotalPages > 5 && currentPage < vehiclesData.TotalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Show last page if not visible in the current range */}
                {vehiclesData.TotalPages > 5 && currentPage < vehiclesData.TotalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(vehiclesData.TotalPages)}>{vehiclesData.TotalPages}</PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext onClick={handleNext} className={cn(currentPage === vehiclesData.TotalPages && 'pointer-events-none opacity-50')} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
