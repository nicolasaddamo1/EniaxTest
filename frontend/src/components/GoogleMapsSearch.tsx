"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocodeAddress, Geolocation } from "@/services/maps";
import { useToast } from "@/hooks/use-toast";

export function GoogleMapsSearch() {
  const [address, setAddress] = useState("");
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGeocodeAddress = async () => {
    setLoading(true);
    try {
      const data = await geocodeAddress(address);
      setGeolocation(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Geocoding Address",
        description: error.message || "Failed to geocode address.",
      });
    } finally {
      setLoading(false);
    }
  };

  const googleMapsUrl = geolocation
    ? `https://maps.google.com/maps?q=${geolocation.latitude},${geolocation.longitude}&z=15&output=embed`
    : null;

  return (
    <div className="flex flex-col space-y-4 h-full">
      <h2 className="text-lg font-semibold text-center">Google Maps</h2>

      <Input
        type="text"
        placeholder="Enter Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {geolocation && (
        <div className="mt-4">
          <p>
            <strong>Latitude:</strong> {geolocation.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {geolocation.longitude}
          </p>
          <p>
            <strong>Place:</strong> {geolocation.place}
          </p>
        </div>
      )}

      {googleMapsUrl && (
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
        ></iframe>
      )}
      <Button onClick={handleGeocodeAddress} disabled={loading} className="w-full mt-auto">
        {loading ? "Geocode Address" : "Geocode Address"}
      </Button>
    </div>
  );
}
