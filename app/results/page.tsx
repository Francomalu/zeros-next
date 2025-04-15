"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DateCarousel } from "@/components/date-carousel"
import { format, addMinutes, parseISO } from "date-fns"
import {
  ArrowRight,
  Bus,
  Clock,
  CreditCard,
  MapPin,
  Users,
  Wifi,
  Coffee,
  ChevronLeft,
  Calendar,
  Info,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Types for our trip data
interface Trip {
  id: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: number
  price: number
  availableSeats: number
  busType: string
  amenities: string[]
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  // Get search parameters
  const origin = searchParams.get("origin") || ""
  const destination = searchParams.get("destination") || ""
  const tripType = searchParams.get("tripType") || "one-way"
  const departureDate = searchParams.get("departureDate") || format(new Date(), "yyyy-MM-dd")
  const returnDate = searchParams.get("returnDate") || ""
  const passengers = searchParams.get("passengers") || "1"

  // Format dates for display
  const formattedDepartureDate = departureDate ? format(parseISO(departureDate), "EEEE, MMMM d, yyyy") : ""
  const formattedReturnDate = returnDate ? format(parseISO(returnDate), "EEEE, MMMM d, yyyy") : ""

  // Handle date selection from carousel
  const handleDateSelect = (date: string) => {
    // Create new URLSearchParams with the updated date
    const params = new URLSearchParams(searchParams.toString())
    params.set("departureDate", date)

    // Update the URL with the new date
    router.push(`/results?${params.toString()}`)

    // Reset trips and show loading state
    setTrips([])
    setLoading(true)
  }

  // Handle trip selection
  const handleSelectTrip = (trip: Trip) => {
    // Create URL parameters for checkout
    const params = new URLSearchParams()
    params.append("tripId", trip.id)
    params.append("origin", trip.origin)
    params.append("destination", trip.destination)
    params.append("departureDate", departureDate)
    params.append("departureTime", trip.departureTime)
    params.append("arrivalTime", trip.arrivalTime)
    params.append("duration", trip.duration.toString())
    params.append("price", trip.price.toString())
    params.append("passengers", passengers)
    params.append("busType", trip.busType)

    // Navigate to checkout page
    router.push(`/checkout?${params.toString()}`)
  }

  // Generate mock trip data based on search parameters
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      const mockTrips = generateMockTrips(origin, destination, departureDate)
      setTrips(mockTrips)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [origin, destination, departureDate])

  // Helper function to generate mock trips
  function generateMockTrips(origin: string, destination: string, date: string): Trip[] {
    const baseDate = parseISO(date)
    const startHours = [6, 8, 10, 12, 14, 16, 18]

    return startHours.map((hour, index) => {
      const departureTime = new Date(baseDate)
      departureTime.setHours(hour, Math.floor(Math.random() * 60), 0)

      const duration = 30 + Math.floor(Math.random() * 40) // 30-70 minutes
      const arrivalTime = addMinutes(departureTime, duration)

      const amenities = []
      if (Math.random() > 0.3) amenities.push("wifi")
      if (Math.random() > 0.5) amenities.push("usb")
      if (Math.random() > 0.7) amenities.push("refreshments")

      return {
        id: `trip-${index}`,
        origin: formatLocation(origin),
        destination: formatLocation(destination),
        departureTime: format(departureTime, "HH:mm"),
        arrivalTime: format(arrivalTime, "HH:mm"),
        duration,
        price: 15 + Math.floor(Math.random() * 20), // $15-35
        availableSeats: 5 + Math.floor(Math.random() * 25), // 5-30 seats
        busType: Math.random() > 0.5 ? "Express" : "Standard",
        amenities,
      }
    })
  }

  // Helper to format location names
  function formatLocation(location: string): string {
    return location.charAt(0).toUpperCase() + location.slice(1)
  }

  // Helper to format duration
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-800 font-display">FamilyTransit</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex border-blue-600 text-blue-600 hover:bg-blue-50">
              Log In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Book Now</Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Back button and search summary */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-blue-800 font-display mb-2">
                  {formatLocation(origin)} to {formatLocation(destination)}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDepartureDate}</span>
                  <span>•</span>
                  <Users className="h-4 w-4" />
                  <span>
                    {passengers} {Number.parseInt(passengers) === 1 ? "Passenger" : "Passengers"}
                  </span>
                </div>
                {tripType === "round-trip" && returnDate && (
                  <div className="mt-2 text-gray-600">
                    <span className="font-medium">Return:</span> {formattedReturnDate}
                  </div>
                )}
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Modify Search</Button>
            </div>
          </div>
        </div>

        {/* Date Carousel */}
        <div className="mb-6">
          <DateCarousel
            selectedDate={departureDate}
            onDateSelect={handleDateSelect}
            className="bg-white rounded-lg border shadow-sm p-4"
          />
        </div>

        {/* Trip results */}
        <div className="mb-8">
          <Tabs defaultValue="outbound">
            <TabsList className="mb-4">
              <TabsTrigger value="outbound">Outbound Journey</TabsTrigger>
              {tripType === "round-trip" && returnDate && <TabsTrigger value="return">Return Journey</TabsTrigger>}
            </TabsList>

            <TabsContent value="outbound" className="mt-0">
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 bg-blue-50 border-b">
                  <h2 className="font-display font-bold text-lg text-blue-800">
                    Available Trips: {formatLocation(origin)} → {formatLocation(destination)}
                  </h2>
                  <p className="text-sm text-blue-700">{formattedDepartureDate}</p>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600">Searching for available trips...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="p-8 text-center">
                    <Info className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trips available</h3>
                    <p className="text-gray-600">
                      We couldn't find any trips matching your search criteria. Please try different dates or locations.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y">
                      {trips.map((trip) => (
                        <div key={trip.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="grid md:grid-cols-4 gap-4">
                            {/* Time and route */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-blue-900">{trip.departureTime}</div>
                                <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                                <div className="text-2xl font-bold text-blue-900">{trip.arrivalTime}</div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatDuration(trip.duration)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-700">{trip.origin} Terminal</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-700">{trip.destination} Terminal</span>
                              </div>
                            </div>

                            {/* Bus details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Bus className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{trip.busType} Bus</span>
                                {trip.busType === "Express" && (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Express</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{trip.availableSeats}</span> seats available
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {trip.amenities.includes("wifi") && (
                                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                    <Wifi className="h-3 w-3" />
                                    <span>WiFi</span>
                                  </div>
                                )}
                                {trip.amenities.includes("usb") && (
                                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M22 8.35V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
                                      <path d="M6 12h12" />
                                      <path d="M12 22V12" />
                                    </svg>
                                    <span>USB</span>
                                  </div>
                                )}
                                {trip.amenities.includes("refreshments") && (
                                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                    <Coffee className="h-3 w-3" />
                                    <span>Refreshments</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-sm text-gray-500">Price per person</div>
                              <div className="text-2xl font-bold text-blue-800">${trip.price}</div>
                              <div className="text-sm text-gray-500">
                                Total: ${trip.price * Number.parseInt(passengers)}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSelectTrip(trip)}
                              >
                                Select
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            {tripType === "round-trip" && returnDate && (
              <TabsContent value="return" className="mt-0">
                <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Return Journey</h3>
                  <p className="text-gray-600 mb-4">
                    {formatLocation(destination)} to {formatLocation(origin)} on {formattedReturnDate}
                  </p>
                  <p className="text-blue-600">
                    Please select your outbound journey first to view available return options.
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Booking information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-blue-800 font-display mb-4">Booking Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Payment Methods</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Credit/Debit Cards</span>
                </div>
                <p className="text-sm text-gray-500">We accept Visa, Mastercard, American Express, and Discover.</p>
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">Cancellation Policy</h3>
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours before departure. A 50% fee applies for cancellations made less than
                  24 hours before departure.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Need assistance? Call us at <span className="font-medium">(555) 123-4567</span> or email{" "}
              <span className="font-medium">bookings@familytransit.com</span>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Bus className="h-6 w-6 text-blue-300" />
              <span className="text-xl font-bold font-display">FamilyTransit</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-blue-200 text-sm">
                &copy; {new Date().getFullYear()} FamilyTransit. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
