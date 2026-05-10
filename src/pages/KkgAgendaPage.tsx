import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContext';

export default function KkgAgendaPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { content } = useSiteContent();
  // Assuming agenda is part of kkg or kegiatan in site content.
  // For now let's just show a placeholder or map from content if it existed.
  
  return (
    <div className="pt-24 pb-20 bg-light-gray min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-4xl font-heading font-bold text-soft-black mb-12">Agenda Kegiatan KKG</h1>
        <div className="text-gray-600">
            Agenda kegiatan akan ditampilkan di sini.
        </div>
      </div>
    </div>
  );
}
