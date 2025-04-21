'use client';

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BOMBONERA_COORDS = "-34.635611,-58.364203";

export function GoogleMapsSearch() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div>Error: Falta la API Key de Google Maps</div>;
  }

  const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=250x250&location=${BOMBONERA_COORDS}&heading=90&pitch=0&key=${apiKey}`;

  return (
    <>
      <CardHeader>
        <CardTitle>Api Street View</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={imageUrl}
          alt="Street View de La Bombonera"
          className="rounded-lg w-full h-auto object-cover"
        />
      </CardContent>
    </>
  );
}
