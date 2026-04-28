import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentSimulation() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePay = async () => {
    setLoading(true);
    try {
      await axios.post('/api/confirm-payment', { id });
      setTimeout(() => {
        navigate(`/success?id=${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!id) return <div>Invalid Session</div>;

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-cream-200">
        <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <Globe className="w-8 h-8 text-ocean-600" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-earth-900 mb-2">Simulateur FedaPay</h1>
        <p className="text-earth-600 mb-8 font-light italic">Ceci est une simulation de paiement pour la démo.</p>
        
        <button 
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 bg-ocean-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirmer le paiement'}
        </button>
      </div>
    </div>
  );
}

const Globe = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);
