"use client";

import { GoogleMapsSearch } from "@/components/GoogleMapsSearch";
import { TelegramForm } from "@/components/TelegramForm";
import { Card } from "@/components/ui/card";
import { ViberForm } from "@/components/ViberForm";
import { useState } from "react";


export default function Home() {
  return (
    <div className="dark">
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Comms Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <TelegramForm />
          </Card>

          <Card>
            <GoogleMapsSearch />
          </Card>

          <Card>
            <ViberForm />
          </Card>
        </div>
      </div>
    </div>
  );
}

