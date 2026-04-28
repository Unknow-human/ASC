import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, QrCode, Download, ArrowRight, Printer, Mail } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { useConfig } from './ConfigContext';

export default function SuccessPage() {
  const { logo } = useConfig();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [reservation, setReservation] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyAndFetch = async () => {
      if (id) {
        try {
          // 1. Verify payment status
          const verifyResp = await axios.get(`/api/reservations/${id}/verify-payment`);
          
          if (verifyResp.data.success) {
            // 2. If success, fetch details
            const detailsResp = await axios.get(`/api/reservations/${id}`);
            setReservation(detailsResp.data);
          } else {
            setError(verifyResp.data.message || 'Le paiement n\'a pas pu être vérifié.');
          }
        } catch (err) {
          console.error('Error verifying reservation:', err);
          setError('Une erreur est survenue lors de la vérification de votre paiement.');
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyAndFetch();
  }, [id]);

  const downloadTicket = async () => {
    if (!ticketRef.current || !reservation) return;
    
    setDownloading(true);
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `ticket-asc-${reservation.ticket_code}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Une erreur est survenue lors de la génération de l\'image.');
    } finally {
      setDownloading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
        <p className="text-earth-600 font-medium font-serif italic">Vérification de votre paiement...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </div>
        <h1 className="text-2xl font-serif font-bold text-earth-900 mb-2">Oups !</h1>
        <p className="text-earth-600 max-w-md mb-8">{error || 'Réservation introuvable.'}</p>
        <Link to="/" className="px-8 py-3 bg-ocean-600 text-white rounded-xl font-bold shadow-lg shadow-ocean-600/20">
           Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-20 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-earth-900 mb-2">Paiement Réussi !</h1>
          <p className="text-earth-600">Votre réservation est confirmée.</p>
        </div>

        {/* Ticket Container */}
        <div ref={ticketRef} className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-cream-200">
           <div className="bg-earth-900 p-8 text-cream-50 flex justify-between items-center">
              <div>
                <h2 className="font-serif text-xl font-bold">Africa Sound City</h2>
                <p className="text-cream-300 text-xs uppercase tracking-widest mt-1">Ticket de Réservation</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-full overflow-hidden border-2 border-gold-400 p-0.5 shadow-md">
                <img src={logo} alt="ASC Logo" className="w-full h-full object-cover rounded-full" />
              </div>
           </div>

           <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-[10px] text-earth-400 uppercase font-bold tracking-wider">Client</p>
                    <p className="font-bold text-earth-900 truncate">{reservation.client_name}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-earth-400 uppercase font-bold tracking-wider">Service</p>
                    <p className="font-bold text-ocean-600 capitalize">{reservation.type}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-earth-400 uppercase font-bold tracking-wider">Date</p>
                    <p className="font-bold text-earth-900">{format(new Date(reservation.date), 'dd/MM/yyyy')}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-earth-400 uppercase font-bold tracking-wider">Horaire</p>
                    <p className="font-bold text-earth-900">{reservation.start_time} {reservation.end_time ? `- ${reservation.end_time}` : ''}</p>
                 </div>
              </div>

              <div className="bg-cream-50 p-6 rounded-2xl flex flex-col items-center border border-dashed border-cream-300">
                 <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                    <QrCode className="w-32 h-32 text-earth-900" />
                 </div>
                 <p className="text-[10px] text-earth-400 uppercase font-bold mb-1">Code de référence</p>
                 <p className="text-2xl font-mono font-bold text-ocean-600 tracking-[0.2em]">{reservation.ticket_code}</p>
              </div>

              <div className="text-center text-[10px] text-earth-400 italic">
                 Veuillez présenter ce ticket lors de votre arrivée.
              </div>
           </div>
        </div>

        <div className="mt-8">
           <button 
             onClick={downloadTicket}
             disabled={downloading}
             className="w-full flex items-center justify-center gap-3 py-4 bg-ocean-600 text-white rounded-2xl font-bold shadow-xl shadow-ocean-600/20 hover:bg-ocean-700 transition-all active:scale-[0.98] disabled:opacity-50"
           >
             {downloading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
             ) : (
               <>
                 <Download className="w-5 h-5" /> Télécharger mon ticket (Image)
               </>
             )}
           </button>
        </div>

        <Link to="/" className="mt-12 flex items-center justify-center gap-2 text-earth-400 font-bold hover:text-earth-600 transition-all">
           Retour à l'accueil <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
