import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Layers, 
  Search, 
  Filter, 
  MapPin, 
  Info,
  Eye,
  EyeOff,
  Home,
  Trees,
  Droplets
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Atlas = () => {
  // Layer visibility state
  const [layers, setLayers] = useState({
    ifr: true,
    cfr: true,
    cr: false,
    villages: true,
    landuse: false,
    waterBodies: true,
  });

  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // Enhanced demo data for FRA claims with land ownership details
  const mockFraData = [
    {
      id: 1,
      type: 'IFR',
      position: [20.2961, 85.8245] as [number, number],
      bounds: [
        [20.2850, 85.8100] as [number, number],
        [20.3072, 85.8390] as [number, number]
      ],
      title: 'Bhubaneswar Tribal Settlement',
      claimNumber: 'IFR/OD/BBSR/2023/001',
      village: 'Chandaka Village',
      district: 'Khordha',
      state: 'Odisha',
      area: '4.2 hectares',
      status: 'Verified',
      pattaHolder: 'Ramesh Majhi',
      aadhaar: '****-****-2341',
      phone: '+91-9876543210',
      submissionDate: '15-March-2023',
      verificationDate: '10-April-2023',
      surveyNumber: 'RS-145/2A',
      landType: 'Forest Land',
      cultivation: 'Mixed Crops, Fruit Trees',
      familySize: 6,
      schemes: ['Jal Jeevan Mission', 'PM-KISAN', 'Forest Conservation', 'MGNREGA'],
      documents: ['Patta Certificate', 'Survey Settlement', 'Aadhaar Card', 'Bank Details']
    },
    {
      id: 2,
      type: 'CFR',
      position: [19.0760, 84.0054] as [number, number],
      bounds: [
        [19.0500, 83.9800] as [number, number],
        [19.1020, 84.0308] as [number, number]
      ],
      title: 'Simlipal Forest Community Rights',
      claimNumber: 'CFR/OD/MYB/2023/045',
      village: 'Jenabil Community',
      district: 'Mayurbhanj',
      state: 'Odisha',
      area: '245 hectares',
      status: 'Under Review',
      pattaHolder: 'Jenabil Gram Sabha',
      representative: 'Sukdev Hansdah',
      phone: '+91-9845123456',
      submissionDate: '20-February-2023',
      surveyNumber: 'CFR-MYB-245',
      landType: 'Reserved Forest',
      cultivation: 'Sal Forest, NTFP Collection',
      households: 85,
      population: 420,
      schemes: ['Forest Conservation', 'MGNREGA', 'Tribal Development'],
      documents: ['Community Rights Certificate', 'Gram Sabha Resolution', 'Forest Survey']
    },
    {
      id: 3,
      type: 'IFR',
      position: [21.5037, 84.4408] as [number, number],
      bounds: [
        [21.4920, 84.4300] as [number, number],
        [21.5154, 84.4516] as [number, number]
      ],
      title: 'Rourkela Tribal Farm',
      claimNumber: 'IFR/OD/RKL/2023/078',
      village: 'Bondamunda Village',
      district: 'Sundargarh',
      state: 'Odisha',
      area: '3.8 hectares',
      status: 'Verified',
      pattaHolder: 'Mangala Oram',
      aadhaar: '****-****-5678',
      phone: '+91-9123456789',
      submissionDate: '10-January-2023',
      verificationDate: '25-March-2023',
      surveyNumber: 'RS-89/1B',
      landType: 'Forest Land',
      cultivation: 'Paddy, Vegetables, Cashew',
      familySize: 8,
      schemes: ['Jal Jeevan Mission', 'PM Awas Yojana', 'Kisan Credit Card'],
      documents: ['Patta Certificate', 'Caste Certificate', 'Income Certificate', 'Bank Passbook']
    },
    {
      id: 4,
      type: 'IFR',
      position: [19.3133, 84.7941] as [number, number],
      bounds: [
        [19.3050, 84.7850] as [number, number],
        [19.3216, 84.8032] as [number, number]
      ],
      title: 'Puri Coastal Settlement',
      claimNumber: 'IFR/OD/PUR/2023/112',
      village: 'Konark Village',
      district: 'Puri',
      state: 'Odisha',
      area: '2.1 hectares',
      status: 'Verified',
      pattaHolder: 'Subash Behera',
      aadhaar: '****-****-9012',
      phone: '+91-9234567890',
      submissionDate: '05-April-2023',
      verificationDate: '18-May-2023',
      surveyNumber: 'RS-234/3C',
      landType: 'Coastal Forest',
      cultivation: 'Coconut, Cashew, Fishing',
      familySize: 5,
      schemes: ['PM-KISAN', 'Pradhan Mantri Matsya Sampada', 'Coastal Area Development'],
      documents: ['Patta Certificate', 'Fisherman License', 'Boat Registration']
    },
    {
      id: 5,
      type: 'CFR',
      position: [20.4625, 85.8830] as [number, number],
      bounds: [
        [20.4400, 85.8600] as [number, number],
        [20.4850, 85.9060] as [number, number]
      ],
      title: 'Cuttack Forest Collective',
      claimNumber: 'CFR/OD/CTC/2023/089',
      village: 'Choudwar Community',
      district: 'Cuttack',
      state: 'Odisha',
      area: '178 hectares',
      status: 'Approved',
      pattaHolder: 'Choudwar Gram Panchayat',
      representative: 'Prafulla Kumar Das',
      phone: '+91-9345678901',
      submissionDate: '12-March-2023',
      verificationDate: '28-April-2023',
      approvalDate: '15-June-2023',
      surveyNumber: 'CFR-CTC-178',
      landType: 'Protected Forest',
      cultivation: 'Bamboo Plantation, Medicinal Plants',
      households: 65,
      population: 312,
      schemes: ['Van Dhan Vikas', 'MGNREGA', 'SHG Development'],
      documents: ['CFR Title', 'Management Plan', 'Biodiversity Register']
    }
  ];

  const layerConfig = [
    { id: 'ifr', name: 'IFR Claims', color: 'bg-success', count: 4, icon: Home },
    { id: 'cfr', name: 'CFR Areas', color: 'bg-primary', count: 1, icon: Trees },
    { id: 'cr', name: 'CR Claims', color: 'bg-accent', count: 0, icon: MapPin },
    { id: 'villages', name: 'Village Boundaries', color: 'bg-muted', count: 5, icon: MapPin },
    { id: 'landuse', name: 'Land Use', color: 'bg-warning', count: 0, icon: Trees },
    { id: 'waterBodies', name: 'Water Bodies', color: 'bg-tribal', count: 3, icon: Droplets },
  ];

  const toggleLayer = (layerId: string) => {
    setLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // Custom icons for different claim types
  const createCustomIcon = (type: string) => {
    const color = type === 'IFR' ? '#16a34a' : type === 'CFR' ? '#2563eb' : '#dc2626';
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      className: 'custom-marker'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <Badge className="status-verified">Verified</Badge>;
      case 'under review':
        return <Badge className="status-pending">Under Review</Badge>;
      case 'rejected':
        return <Badge className="status-rejected">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-background border-r overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">FRA Atlas</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Interactive WebGIS for Forest Rights Act
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search villages, claims..." className="pl-9" />
          </div>

          {/* Layers Control */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layerConfig.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className="flex items-center space-x-2 text-left"
                    >
                      {layers[layer.id as keyof typeof layers] ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <layer.icon className="h-3 w-3" />
                      <div className={`w-3 h-3 rounded ${layer.color}`} />
                      <span className="text-sm">{layer.name}</span>
                    </button>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {layer.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feature Info */}
          {selectedFeature && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Feature Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-lg">{selectedFeature.type} Claim</h4>
                  <p className="text-sm text-muted-foreground font-mono">{selectedFeature.claimNumber}</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{selectedFeature.pattaHolder}</span>
                    
                    <span className="text-muted-foreground">Village:</span>
                    <span>{selectedFeature.village}</span>
                    
                    <span className="text-muted-foreground">District:</span>
                    <span>{selectedFeature.district}</span>
                    
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium text-success">{selectedFeature.area}</span>
                    
                    {selectedFeature.surveyNumber && (
                      <>
                        <span className="text-muted-foreground">Survey No:</span>
                        <span className="font-mono text-xs">{selectedFeature.surveyNumber}</span>
                      </>
                    )}
                    
                    {selectedFeature.landType && (
                      <>
                        <span className="text-muted-foreground">Land Type:</span>
                        <span>{selectedFeature.landType}</span>
                      </>
                    )}
                    
                    {selectedFeature.cultivation && (
                      <>
                        <span className="text-muted-foreground">Cultivation:</span>
                        <span className="text-xs">{selectedFeature.cultivation}</span>
                      </>
                    )}
                    
                    {selectedFeature.familySize && (
                      <>
                        <span className="text-muted-foreground">Family Size:</span>
                        <span>{selectedFeature.familySize} members</span>
                      </>
                    )}
                    
                    {selectedFeature.households && (
                      <>
                        <span className="text-muted-foreground">Households:</span>
                        <span>{selectedFeature.households}</span>
                      </>
                    )}
                    
                    {selectedFeature.population && (
                      <>
                        <span className="text-muted-foreground">Population:</span>
                        <span>{selectedFeature.population}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedFeature.status)}
                    </div>
                  </div>
                  
                  {selectedFeature.phone && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="text-xs font-mono">{selectedFeature.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedFeature.submissionDate && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Submitted: {selectedFeature.submissionDate}</p>
                      {selectedFeature.verificationDate && (
                        <p>Verified: {selectedFeature.verificationDate}</p>
                      )}
                      {selectedFeature.approvalDate && (
                        <p>Approved: {selectedFeature.approvalDate}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Linked Government Schemes:</h5>
                  <div className="space-y-1">
                    {selectedFeature.schemes?.map((scheme: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                        {scheme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedFeature.documents && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Documents Available:</h5>
                    <div className="space-y-1">
                      {selectedFeature.documents.map((doc: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t">
                  <Button size="sm" className="w-full">
                    View Complete FRA Documents
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Download Land Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setSelectedFeature(mockFraData[0])}
              >
                <Info className="h-4 w-4 mr-2" />
                Show Sample Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[20.5937, 84.9629]} // Center on Odisha, India
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Land Ownership Areas - Polygons */}
          {layers.ifr && mockFraData
            .filter(item => item.type === 'IFR')
            .map(claim => (
              <React.Fragment key={`ifr-polygon-${claim.id}`}>
                <Rectangle
                  bounds={claim.bounds}
                  pathOptions={{
                    color: '#16a34a',
                    fillColor: '#16a34a',
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedFeature(claim)
                  }}
                />
                <Marker
                  position={claim.position}
                  icon={createCustomIcon(claim.type)}
                  eventHandlers={{
                    click: () => setSelectedFeature(claim)
                  }}
                >
                  <Popup className="fra-popup">
                    <div className="p-3 min-w-[280px]">
                      <h3 className="font-semibold mb-2 text-primary">{claim.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <p><strong>Claim:</strong></p>
                          <p className="text-xs font-mono">{claim.claimNumber}</p>
                          <p><strong>Owner:</strong></p>
                          <p>{claim.pattaHolder}</p>
                          <p><strong>Village:</strong></p>
                          <p>{claim.village}</p>
                          <p><strong>Area:</strong></p>
                          <p className="text-success font-medium">{claim.area}</p>
                          <p><strong>Survey No:</strong></p>
                          <p className="text-xs">{claim.surveyNumber}</p>
                          <p><strong>Land Type:</strong></p>
                          <p>{claim.landType}</p>
                          <p><strong>Cultivation:</strong></p>
                          <p className="text-xs">{claim.cultivation}</p>
                          <p><strong>Family Size:</strong></p>
                          <p>{claim.familySize} members</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              claim.status === 'Verified' 
                                ? 'bg-success/20 text-success' 
                                : claim.status === 'Approved'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {claim.status}
                            </span>
                          </p>
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Contact: {claim.phone}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFeature(claim)}
                        className="mt-3 w-full px-3 py-2 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
                      >
                        View Complete Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

          {/* CFR Areas - Larger Polygons */}
          {layers.cfr && mockFraData
            .filter(item => item.type === 'CFR')
            .map(claim => (
              <React.Fragment key={`cfr-${claim.id}`}>
                <Rectangle
                  bounds={claim.bounds}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                  eventHandlers={{
                    click: () => setSelectedFeature(claim)
                  }}
                />
                <Marker
                  position={claim.position}
                  icon={createCustomIcon(claim.type)}
                  eventHandlers={{
                    click: () => setSelectedFeature(claim)
                  }}
                >
                  <Popup>
                    <div className="p-3 min-w-[280px]">
                      <h3 className="font-semibold mb-2 text-primary">{claim.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <p><strong>Claim:</strong></p>
                          <p className="text-xs font-mono">{claim.claimNumber}</p>
                          <p><strong>Community:</strong></p>
                          <p>{claim.village}</p>
                          <p><strong>Representative:</strong></p>
                          <p>{claim.representative}</p>
                          <p><strong>Area:</strong></p>
                          <p className="text-primary font-medium">{claim.area}</p>
                          <p><strong>Households:</strong></p>
                          <p>{claim.households}</p>
                          <p><strong>Population:</strong></p>
                          <p>{claim.population}</p>
                          <p><strong>Land Type:</strong></p>
                          <p>{claim.landType}</p>
                          <p><strong>Activities:</strong></p>
                          <p className="text-xs">{claim.cultivation}</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              claim.status === 'Approved' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {claim.status}
                            </span>
                          </p>
                        </div>
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground">
                            Contact: {claim.phone}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFeature(claim)}
                        className="mt-3 w-full px-3 py-2 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
                      >
                        View Community Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={claim.position}
                  radius={3000}
                  pathOptions={{
                    color: "#2563eb",
                    fillColor: "#2563eb",
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '3, 3'
                  }}
                />
              </React.Fragment>
            ))}

          {/* Village Boundaries */}
          {layers.villages && mockFraData.map(village => (
            <Rectangle
              key={`village-${village.id}`}
              bounds={[
                [village.position[0] - 0.02, village.position[1] - 0.02],
                [village.position[0] + 0.02, village.position[1] + 0.02]
              ]}
              pathOptions={{
                color: "#64748b",
                weight: 1,
                fillOpacity: 0.05,
                dashArray: '2, 4'
              }}
            />
          ))}

          {/* Water Bodies */}
          {layers.waterBodies && (
            <>
              <Circle
                center={[20.3, 85.8]}
                radius={2000}
                pathOptions={{
                  color: "#0ea5e9",
                  fillColor: "#0ea5e9",
                  fillOpacity: 0.4
                }}
              />
              <Circle
                center={[19.8, 84.8]}
                radius={1500}
                pathOptions={{
                  color: "#0ea5e9",
                  fillColor: "#0ea5e9",
                  fillOpacity: 0.4
                }}
              />
              <Circle
                center={[20.8, 84.3]}
                radius={1200}
                pathOptions={{
                  color: "#0ea5e9",
                  fillColor: "#0ea5e9",
                  fillOpacity: 0.4
                }}
              />
            </>
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur rounded-lg p-3 shadow-card z-[1000]">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>IFR Claims</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>CFR Areas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-muted-foreground"></div>
              <span>Village Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-tribal rounded-full opacity-60"></div>
              <span>Water Bodies</span>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur rounded-lg p-3 shadow-card z-[1000]">
          <div className="text-sm">
            <p className="font-semibold text-primary">FRA Atlas - Odisha Region</p>
            <p className="text-muted-foreground text-xs">
              Showing {mockFraData.length} active claims • Interactive land parcels • Demo data
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              🔍 Click on shaded areas to view land ownership details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atlas;