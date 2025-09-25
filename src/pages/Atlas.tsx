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

  // Mock data for FRA claims and features
  const mockFraData = [
    {
      id: 1,
      type: 'IFR',
      position: [21.1458, 82.9739] as [number, number],
      title: 'Koraput Village IFR',
      claimNumber: 'IFR/OD/KPT/2023/001',
      village: 'Koraput Village',
      district: 'Koraput',
      state: 'Odisha',
      area: '2.5 hectares',
      status: 'Verified',
      pattaHolder: 'Ramesh Kumar',
      submissionDate: '15-March-2023',
      verificationDate: '10-April-2023',
      schemes: ['Jal Jeevan Mission', 'PM-KISAN', 'Forest Conservation']
    },
    {
      id: 2,
      type: 'CFR',
      position: [21.3, 83.2] as [number, number],
      title: 'Bastar CFR Area',
      claimNumber: 'CFR/CG/BST/2023/045',
      village: 'Bastar Community',
      district: 'Bastar',
      state: 'Chhattisgarh',
      area: '150 hectares',
      status: 'Under Review',
      pattaHolder: 'Village Committee',
      submissionDate: '20-February-2023',
      schemes: ['Forest Conservation', 'MGNREGA']
    },
    {
      id: 3,
      type: 'IFR',
      position: [20.9, 82.7] as [number, number],
      title: 'Rayagada IFR',
      claimNumber: 'IFR/OD/RYG/2023/078',
      village: 'Rayagada Village',
      district: 'Rayagada',
      state: 'Odisha',
      area: '3.2 hectares',
      status: 'Verified',
      pattaHolder: 'Sita Devi',
      submissionDate: '10-January-2023',
      verificationDate: '25-March-2023',
      schemes: ['Jal Jeevan Mission', 'PM Awas Yojana']
    },
  ];

  const layerConfig = [
    { id: 'ifr', name: 'IFR Claims', color: 'bg-success', count: 8234, icon: Home },
    { id: 'cfr', name: 'CFR Areas', color: 'bg-primary', count: 1256, icon: Trees },
    { id: 'cr', name: 'CR Claims', color: 'bg-accent', count: 3456, icon: MapPin },
    { id: 'villages', name: 'Village Boundaries', color: 'bg-muted', count: 2547, icon: MapPin },
    { id: 'landuse', name: 'Land Use', color: 'bg-warning', count: 456, icon: Trees },
    { id: 'waterBodies', name: 'Water Bodies', color: 'bg-tribal', count: 789, icon: Droplets },
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
                  <h4 className="font-medium">{selectedFeature.type} Claim</h4>
                  <p className="text-sm text-muted-foreground">{selectedFeature.claimNumber}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Village:</span>
                    <span>{selectedFeature.village}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">District:</span>
                    <span>{selectedFeature.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span>{selectedFeature.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(selectedFeature.status)}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Linked Schemes:</h5>
                  <div className="space-y-1">
                    {selectedFeature.schemes?.map((scheme: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                        {scheme}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button size="sm" className="w-full">
                  View Full Details
                </Button>
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
          center={[21.1458, 82.9739]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* IFR Claims */}
          {layers.ifr && mockFraData
            .filter(item => item.type === 'IFR')
            .map(claim => (
              <Marker
                key={`ifr-${claim.id}`}
                position={claim.position}
                icon={createCustomIcon(claim.type)}
                eventHandlers={{
                  click: () => setSelectedFeature(claim)
                }}
              >
                <Popup className="fra-popup">
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold mb-2">{claim.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Claim:</strong> {claim.claimNumber}</p>
                      <p><strong>Village:</strong> {claim.village}</p>
                      <p><strong>Area:</strong> {claim.area}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          claim.status === 'Verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {claim.status}
                        </span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedFeature(claim)}
                      className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* CFR Areas */}
          {layers.cfr && mockFraData
            .filter(item => item.type === 'CFR')
            .map(claim => (
              <React.Fragment key={`cfr-${claim.id}`}>
                <Marker
                  position={claim.position}
                  icon={createCustomIcon(claim.type)}
                  eventHandlers={{
                    click: () => setSelectedFeature(claim)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold mb-2">{claim.title}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Claim:</strong> {claim.claimNumber}</p>
                        <p><strong>Community:</strong> {claim.village}</p>
                        <p><strong>Area:</strong> {claim.area}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            claim.status === 'Verified' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {claim.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={claim.position}
                  radius={2000}
                  color="#2563eb"
                  fillColor="#2563eb"
                  fillOpacity={0.1}
                />
              </React.Fragment>
            ))}

          {/* Village Boundaries */}
          {layers.villages && mockFraData.map(village => (
            <Rectangle
              key={`village-${village.id}`}
              bounds={[
                [village.position[0] - 0.05, village.position[1] - 0.05],
                [village.position[0] + 0.05, village.position[1] + 0.05]
              ]}
              color="#64748b"
              weight={2}
              fillOpacity={0.1}
            />
          ))}

          {/* Water Bodies */}
          {layers.waterBodies && (
            <>
              <Circle
                center={[21.2, 83.0]}
                radius={1000}
                color="#3b82f6"
                fillColor="#3b82f6"
                fillOpacity={0.3}
              />
              <Circle
                center={[21.0, 82.8]}
                radius={800}
                color="#3b82f6"
                fillColor="#3b82f6"
                fillOpacity={0.3}
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
            <p className="font-semibold text-primary">FRA Atlas Active</p>
            <p className="text-muted-foreground text-xs">
              Showing {mockFraData.length} claims • Interactive layers enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atlas;