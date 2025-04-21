// components/GoogleMapsCard.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface GoogleMapsCardProps {
    location: string;
    title?: string;
    width?: number | string;
    height?: number | string;
}

export function GoogleMapsCard({
    location = "Brandsen 805",
    title = "Api Google Maps",
    width = "100%",
    height = "550px"
}: GoogleMapsCardProps) {
    if (!apiKey) {
        console.error("Google Maps API key no está configurada");
        return <div>Error: Falta API key de Google Maps</div>;
    }

    const encodedLocation = encodeURIComponent(location);
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedLocation}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Api Google Maps</CardTitle>
            </CardHeader>
            <CardContent>
                <iframe
                    width={width}
                    height={height}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapUrl}
                    className="rounded-lg"
                />
            </CardContent>
        </Card>
    );
}