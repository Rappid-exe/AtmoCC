"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CloudLightning,
  Filter,
  BarChart3,
  Download,
  Info,
  ShoppingCart,
  Cpu,
  Activity,
  BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define a type for the location data
type Location = {
  id: number;
  name: string;
  state: string;
  status: string;
  captureRate: string;
  efficiency: string;
  lastUpdated: string;
  image: string;
};

// Sample data for carbon capture locations
const locationData: Location[] = [
  {
    id: 1,
    name: "Sierra Nevada Facility",
    state: "California",
    status: "Active",
    captureRate: "1,250",
    efficiency: "92%",
    lastUpdated: "2h ago",
    image: "/alpine-research-outpost.png",
  },
  {
    id: 2,
    name: "Gulf Coast Plant",
    state: "Texas",
    status: "Active",
    captureRate: "1,850",
    efficiency: "89%",
    lastUpdated: "4h ago",
    image: "/sprawling-industrial-complex.png",
  },
  {
    id: 3,
    name: "Great Lakes Center",
    state: "Michigan",
    status: "Active",
    captureRate: "980",
    efficiency: "91%",
    lastUpdated: "1h ago",
    image: "/serene-lakeside-retreat.png",
  },
  {
    id: 4,
    name: "Rocky Mountain Site",
    state: "Colorado",
    status: "Maintenance",
    captureRate: "650",
    efficiency: "85%",
    lastUpdated: "6h ago",
    image: "/alpine-research-outpost.png",
  },
  {
    id: 5,
    name: "Appalachian Facility",
    state: "Pennsylvania",
    status: "Active",
    captureRate: "1,120",
    efficiency: "90%",
    lastUpdated: "3h ago",
    image: "/woodland-research-outpost.png",
  },
  {
    id: 6,
    name: "Pacific Northwest Station",
    state: "Washington",
    status: "Active",
    captureRate: "1,340",
    efficiency: "94%",
    lastUpdated: "1h ago",
    image: "/woodland-research-outpost.png",
  },
  {
    id: 7,
    name: "Mojave Desert Array",
    state: "Nevada",
    status: "Active",
    captureRate: "1,750",
    efficiency: "96%",
    lastUpdated: "5h ago",
    image: "/desert-research-outpost.png",
  },
  {
    id: 8,
    name: "Atlantic Coast Facility",
    state: "North Carolina",
    status: "Maintenance",
    captureRate: "780",
    efficiency: "87%",
    lastUpdated: "12h ago",
    image: "/seaside-research-center.png",
  },
]

// Define a type for the carbon API system info (static part)
type CarbonSystemInfo = {
  id: string;
  name: string;
  status: string;
  color: string;
  icon: React.ElementType; // Type for Lucide icons
};

// Carbon API Systems - Keep static info like name, color, icon
const carbonAPISystems: CarbonSystemInfo[] = [
  {
    id: "AC:XX0001",
    name: "System Alpha",
    status: "Active",
    color: "blue",
    icon: Cpu,
  },
  {
    id: "AC:XX0002",
    name: "System Beta",
    status: "Active",
    color: "green",
    icon: Activity,
  },
  {
    id: "AC:XX0003",
    name: "System Gamma",
    status: "Active",
    color: "purple",
    icon: BarChart2,
  },
]

// Define states grid layout
const statesGrid = [
  ["", "WA", "", "", "", "", "ME"],
  ["", "MT", "ND", "MN", "WI", "MI", "NY", "VT", "NH"],
  ["OR", "ID", "SD", "WY", "IA", "IL", "IN", "OH", "PA", "NJ", "MA"],
  ["CA", "NV", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "CT", "RI"],
  ["", "AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DE"],
  ["", "", "", "OK", "LA", "MS", "AL", "GA"],
  ["", "", "", "TX", "", "", "FL"],
]

// Define a type for the API data state
type ApiData = {
  simulated_carbon_units: number;
  period_type?: string;
  calculation_end_time: string;
  // Add other fields from API response if needed (e.g., system_name, calculation_end_time)
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("grid")
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null)
  // State to hold fetched data for each API system
  const [apiSystemData, setApiSystemData] = useState<Record<string, ApiData | null>>({});
  const [loadingApiData, setLoadingApiData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // <<< Fetch data from CarbonAPI on component mount >>>
  useEffect(() => {
    const fetchData = async () => {
      setLoadingApiData(true);
      setApiError(null);
      const fetchedData: Record<string, ApiData | null> = {};
      let encounteredError = false;

      for (const system of carbonAPISystems) {
        try {
          const response = await fetch(`http://127.0.0.1:5001/carbon/${system.id}/units`);
          if (!response.ok) {
            throw new Error(`API request failed for ${system.id}: ${response.statusText}`);
          }
          const data: ApiData = await response.json();
          fetchedData[system.id] = data;
        } catch (error: any) {
          console.error(`Error fetching data for ${system.id}:`, error);
          fetchedData[system.id] = null; // Mark as failed
          encounteredError = true;
        }
      }

      setApiSystemData(fetchedData);
      setLoadingApiData(false);
      if (encounteredError) {
        setApiError("Failed to fetch data for one or more systems. Ensure the CarbonAPI is running.");
      }
    };

    fetchData();
    // Consider adding a timer here to refetch periodically if needed
    // const interval = setInterval(fetchData, 30000); // e.g., every 30 seconds
    // return () => clearInterval(interval); // Cleanup timer on unmount

  }, []); // Empty dependency array ensures this runs only once on mount

  const filteredLocations: Location[] = locationData.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCapture = locationData
    .filter((location) => location.status === "Active")
    .reduce((sum, location) => sum + Number.parseInt(location.captureRate.replace(",", "")), 0)
    .toLocaleString()

  const activeLocations = locationData.filter((location) => location.status === "Active").length

  // Create a map of state abbreviations to locations
  const stateLocations: Record<string, Location> = {}
  locationData.forEach((location) => {
    // Map state names to abbreviations (simplified for our example)
    const stateToAbbreviation: Record<string, string> = {
      California: "CA",
      Texas: "TX",
      Michigan: "MI",
      Colorado: "CO",
      Pennsylvania: "PA",
      Washington: "WA",
      Nevada: "NV",
      "North Carolina": "NC",
    }

    const stateAbbr = stateToAbbreviation[location.state]
    if (stateAbbr) {
      stateLocations[stateAbbr] = location
    }
  })

  return (
    <main className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Facility Overview</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="api">API Systems</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Carbon Capture Locations</h2>
          <p className="text-gray-600">
            Monitoring real-time data from our atmospheric carbon capture facilities across the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Active Capture</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">{totalCapture}</span>
                <span className="ml-1 text-sm text-gray-500">tons CO₂/day</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Active Locations</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">{activeLocations}</span>
                <span className="ml-1 text-sm text-gray-500">of {locationData.length} sites</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Tokenized Credits</span>
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">47,250</span>
                <span className="ml-1 text-sm text-gray-500">verified tokens</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Live Carbon Capture Systems</h2>
          <p className="text-gray-600 mb-6">
            Real-time monitoring of your live carbon capture systems with direct atmospheric extraction.
          </p>

          <section className="mb-12">
            <h3 className="text-xl font-bold mb-4">Live System Monitoring</h3>
            {/* Optional: Display loading or error states */}
            {loadingApiData && <p className="text-gray-500">Loading system data...</p>}
            {apiError && <p className="text-red-500">Error: {apiError}</p>}
            {!loadingApiData && !apiError && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {carbonAPISystems.map((system) => (
                  <CarbonAPISystemCard
                    key={system.id}
                    system={system} // Pass static info (name, icon, color)
                    apiData={apiSystemData[system.id]} // Pass fetched data (or null)
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Capture Locations</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Tabs defaultValue="grid" className="w-[200px]" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {activeTab === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLocations.map((location: Location) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LocationCard location={location} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">U.S. Carbon Capture Locations</h3>
            <TooltipProvider>
              <div className="grid-map-container">
                {statesGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid-map-row">
                    {row.map((state, colIndex) => {
                      const location = state ? stateLocations[state] : null
                      const isActive = location && location.status === "Active"
                      const isMaintenance = location && location.status === "Maintenance"

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`grid-map-cell ${!state ? "grid-map-cell-empty" : ""}`}
                        >
                          {state && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`state-cell ${isActive || isMaintenance ? "cursor-pointer" : ""}`}
                                  onMouseEnter={() => location && setHoveredLocation(location)}
                                  onMouseLeave={() => setHoveredLocation(null)}
                                >
                                  {state}
                                  {location && (
                                    <div
                                      className={`state-dot ${
                                        isActive ? "active-dot" : isMaintenance ? "maintenance-dot" : ""
                                      }`}
                                    ></div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {location && (
                                <TooltipContent side="top">
                                  <p className="font-semibold">{location.name}</p>
                                  <p className="text-xs text-gray-500">{location.state}</p>
                                  <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs">
                                    <div>
                                      <p className="text-gray-500">Capture Rate</p>
                                      <p>{location.captureRate} tons/day</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Status</p>
                                      <p>{location.status}</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {hoveredLocation && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold">{hoveredLocation.name}</h4>
                <p className="text-sm text-gray-500">{hoveredLocation.state}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Capture Rate</p>
                    <p className="font-medium">{hoveredLocation.captureRate} tons/day</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium">{hoveredLocation.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Efficiency</p>
                    <p className="font-medium">{hoveredLocation.efficiency}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{hoveredLocation.lastUpdated}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span className="text-sm">Active Locations</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                <span className="text-sm">Maintenance Locations</span>
              </div>
              <div className="flex items-center ml-auto">
                <Info className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-500">Hover over states with dots for details</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}

function LocationCard({ location }: { location: Location }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full">
        <img src={location.image || "/placeholder.svg"} alt={location.name} className="object-cover w-full h-full" />
        <div className="absolute top-2 right-2">
          <Badge variant={location.status === "Active" ? "default" : "secondary"}>{location.status}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg">{location.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{location.state}</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Capture Rate</p>
            <p className="font-medium">{location.captureRate} tons/day</p>
          </div>
          <div>
            <p className="text-gray-500">Efficiency</p>
            <p className="font-medium">{location.efficiency}</p>
          </div>
          <div className="col-span-2 mt-1">
            <p className="text-gray-500 text-xs">Last updated: {location.lastUpdated}</p>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Modify CarbonAPISystemCard to accept and display apiData
function CarbonAPISystemCard({ system, apiData }: { system: CarbonSystemInfo, apiData: ApiData | null }) {
  const Icon = system.icon;

  // Determine the value to display - use API data if available, otherwise show loading/error
  let displayValue = "--";
  let displayPeriod = "period";
  let displayTime = "Loading...";
  let hasError = false;

  if (apiData === null) {
    // Error occurred during fetch for this system
    displayValue = "Error";
    displayTime = "Error";
    hasError = true;
  } else if (apiData?.simulated_carbon_units !== undefined && apiData?.simulated_carbon_units !== null) {
    // Data successfully fetched
    displayValue = Math.round(apiData.simulated_carbon_units).toLocaleString();
    displayPeriod = apiData.period_type || "period";
    try {
      // Format the timestamp for better readability
      displayTime = new Date(apiData.calculation_end_time).toLocaleString(undefined, {
         year: 'numeric', month: 'short', day: 'numeric', 
         hour: '2-digit', minute: '2-digit', second: '2-digit' 
        }); 
    } catch (e) {
      displayTime = "Invalid Time"; // Fallback if time parsing fails
    }
  }
  // If apiData is undefined/not null, it means still loading (handled by the parent)

  return (
    <Card className={`border-l-4 border-${system.color}-500`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 text-${system.color}-600`} />
            <span className="text-sm font-semibold">{system.name}</span>
          </div>
          <Badge variant={system.status === "Active" ? "default" : "secondary"} className={system.status === "Active" ? `bg-${system.color}-100 text-${system.color}-800` : ''}>
            {system.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-2">ID: {system.id}</p>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-bold">{displayValue}</span>
          {!hasError && displayValue !== "--" && (
             <span className="ml-1 text-sm text-gray-500">units/{displayPeriod}</span>
          )}
        </div>
        {/* Display last updated time */}
        <p className={`text-xs mt-1 ${hasError ? 'text-red-500' : 'text-gray-500'}`}>
            Last Updated: {displayTime}
        </p>
      </CardContent>
    </Card>
  )
}
