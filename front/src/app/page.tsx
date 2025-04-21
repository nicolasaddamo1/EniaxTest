import { FacebookLoginButton } from '@/components/auth/FacebookButton';
import { FacebookProvider } from '@/components/auth/FacebookProvider';
import { GoogleMapsSearch } from "@/components/google-maps-search/GoogleMapsSearch";
import { GoogleMapsCard } from '@/components/map/GoogleMapCard';
import TelegramForm from '@/components/Telegram/TelegramForm';
import TwitterIntegration from '@/components/twitter/TwitterIntegration';
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <FacebookProvider>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6 text-center">Comms Center</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <TelegramForm />
            </Card>
            <Card className="flex items-center justify-center p-4">
              <FacebookLoginButton />
            </Card>
            <Card className="flex items-center justify-center p-4">
              <GoogleMapsCard
                location="Brandsen 805, La Boca, Buenos Aires"
                title="Estadio La Bombonera"
                width="100%"
                height="400px"
              />
            </Card>
            <Card>
              <GoogleMapsSearch />
            </Card>
            <Card>
              <TwitterIntegration />
            </Card>
          </div>
        </div>
      </div>
    </FacebookProvider>
  );
}