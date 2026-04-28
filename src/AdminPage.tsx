import React, { useState, useEffect } from 'react';
import { useConfig } from './ConfigContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Save, X, Calendar, Search, Check, Download, FileText, Table as TableIcon, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'reservations' | 'rates' | 'schedule' | 'reviews'>('reservations');
  const { logo, setLogo, images, setImages, dynamicSections, setDynamicSections, openingHours, setOpeningHours } = useConfig();
  const navigate = useNavigate();
  
  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [validationResult, setValidationResult] = useState<{ success: boolean, message: string, reservation?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  // Rates state
  const [rates, setRates] = useState<any>({ salle: 0, studio: 0, restaut: 0 });
  const [alertMessage, setAlertMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
      fetchRates();
      fetchServerConfig();
      fetchAdminReviews();
    }
  }, [isAuthenticated]);

  const fetchServerConfig = async () => {
    try {
      const resp = await axios.get('/api/config');
      if (resp.data.openingHours) setOpeningHours(resp.data.openingHours);
      if (resp.data.rates) setRates(resp.data.rates);
      if (resp.data.logo) setLogo(resp.data.logo);
      if (resp.data.images) setImages(prev => ({ ...prev, ...resp.data.images }));
      if (resp.data.dynamicSections) setDynamicSections(resp.data.dynamicSections);
    } catch (e) {
      console.error('Error fetching config:', e);
    }
  };

  const authHeader = { headers: { 'x-admin-password': 'asc-admin-2026' } };

  const fetchAdminReviews = async () => {
    try {
      const resp = await axios.get('/api/admin/reviews', authHeader);
      setAdminReviews(resp.data);
    } catch (e) {}
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await axios.post('/api/admin/reviews/status', { id, status }, authHeader);
      fetchAdminReviews();
    } catch (e) {}
  };

  const fetchRates = async () => {
    try {
      const resp = await axios.get('/api/config');
      if (resp.data.rates) {
        setRates(resp.data.rates);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRates = async () => {
    setLoading(true);
    try {
      await axios.post('/api/admin/config', { rates }, authHeader);
      setAlertMessage({ title: 'Succès', message: 'Tarifs mis à jour avec succès.', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ title: 'Erreur', message: 'Une erreur est survenue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    setLoading(true);
    try {
      await axios.post('/api/admin/config', { openingHours }, authHeader);
      setAlertMessage({ title: 'Succès', message: 'Horaires mis à jour avec succès.', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ title: 'Erreur', message: 'Une erreur est survenue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const resp = await axios.get('/api/admin/reservations', authHeader);
      setReservations(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  const dayLabels: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  const handleDayChange = (day: string, field: string, value: any) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'asc-admin-2026') {
      setIsAuthenticated(true);
    } else {
      setAlertMessage({ title: 'Non Autorisé', message: 'Mot de passe incorrect.', type: 'error' });
    }
  };

  const handleValidateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.post('/api/admin/validate-ticket', { code: searchCode }, authHeader);
      setValidationResult(resp.data);
      if (resp.data.success) {
        fetchReservations();
      }
    } catch (err: any) {
      setValidationResult({ success: false, message: err.response?.data?.error || 'Erreur' });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    doc.text('Historique des Réservations - Africa Sound City', 14, 15);
    const tableData = reservations.map(r => [
      r.ticket_code,
      r.type,
      r.client_name,
      format(new Date(r.date), 'dd/MM/yyyy'),
      r.status,
      `${r.total_amount} FCFA`
    ]);
    doc.autoTable({
      head: [['Code', 'Type', 'Client', 'Date', 'Statut', 'Montant']],
      body: tableData,
      startY: 20,
    });
    doc.save(`reservations_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reservations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    XLSX.writeFile(wb, `reservations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleSaveToDB = async () => {
    setLoading(true);
    try {
      await axios.post('/api/admin/config', { logo, images, dynamicSections }, authHeader);
      setAlertMessage({ title: 'Succès', message: 'Configuration enregistrée avec succès dans la base de données !', type: 'success' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ title: 'Erreur', message: 'Erreur lors de l\'enregistrement.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderAlertModal = () => (
    <AnimatePresence>
      {alertMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-cream-50 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border-2 border-gold-400/30 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 relative z-10 ${alertMessage.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {alertMessage.type === 'success' ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
            </div>
            <h3 className="font-serif text-2xl font-bold text-earth-900 mb-2 relative z-10">{alertMessage.title}</h3>
            <p className="text-earth-700 relative z-10 mb-8">{alertMessage.message}</p>
            <button 
              onClick={() => setAlertMessage(null)}
              className="w-full py-3 bg-earth-900 text-gold-400 hover:bg-earth-800 rounded-xl font-bold transition-all relative z-10"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-earth-900 flex items-center justify-center p-6 text-cream-50">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-earth-800 p-8 rounded-2xl shadow-2xl border border-earth-700/50">
          <h1 className="text-2xl font-serif font-bold mb-6 text-center text-gold-400">Accès Administrateur</h1>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-earth-500 text-left">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-earth-900 border border-earth-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-cream-50"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-ocean-500 hover:bg-ocean-600 text-white font-medium py-3 px-4 rounded-xl transition-colors">
            Se connecter
          </button>
          
          <button type="button" onClick={() => navigate('/')} className="w-full mt-4 flex items-center justify-center gap-2 text-earth-500 hover:text-earth-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </button>
        </form>
        {renderAlertModal()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 text-earth-900 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto overflow-hidden">
            <h1 className="text-3xl font-serif font-bold text-ocean-600">Tableau de Bord Admin</h1>
            <div className="flex overflow-x-auto gap-2 mt-6 pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
               <button 
                 onClick={() => setActiveTab('reservations')}
                 className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all text-sm ${activeTab === 'reservations' ? 'bg-earth-900 text-gold-400 shadow-md' : 'bg-white text-earth-600 border border-cream-200 hover:bg-cream-50'}`}
               >
                 Réservations
               </button>
               <button 
                 onClick={() => setActiveTab('rates')}
                 className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all text-sm ${activeTab === 'rates' ? 'bg-earth-900 text-gold-400 shadow-md' : 'bg-white text-earth-600 border border-cream-200 hover:bg-cream-50'}`}
               >
                 Tarifs
               </button>
               <button 
                 onClick={() => setActiveTab('schedule')}
                 className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all text-sm ${activeTab === 'schedule' ? 'bg-earth-900 text-gold-400 shadow-md' : 'bg-white text-earth-600 border border-cream-200 hover:bg-cream-50'}`}
               >
                 Horaires
               </button>
               <button 
                 onClick={() => setActiveTab('reviews')}
                 className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all text-sm ${activeTab === 'reviews' ? 'bg-earth-900 text-gold-400 shadow-md' : 'bg-white text-earth-600 border border-cream-200 hover:bg-cream-50'}`}
               >
                 Avis
               </button>
               <button 
                 onClick={() => setActiveTab('content')}
                 className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold transition-all text-sm ${activeTab === 'content' ? 'bg-earth-900 text-gold-400 shadow-md' : 'bg-white text-earth-600 border border-cream-200 hover:bg-cream-50'}`}
               >
                 Contenu
               </button>
            </div>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <button onClick={() => navigate('/')} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-earth-900 text-cream-50 rounded-xl hover:bg-earth-800 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Quitter
            </button>
          </div>
        </header>

        {activeTab === 'rates' && (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl border border-cream-200 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-earth-900 mb-8 flex items-center gap-3">
              <TableIcon className="w-6 h-6 text-ocean-500" /> Tarification des Services
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-earth-700 mb-2">Location de Salle (FCFA / Heure)</label>
                <input 
                  type="number"
                  value={rates.salle}
                  onChange={e => setRates({ ...rates, salle: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-ocean-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-earth-700 mb-2">Studio d'Enregistrement (FCFA / Heure)</label>
                <input 
                  type="number"
                  value={rates.studio}
                  onChange={e => setRates({ ...rates, studio: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-ocean-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-earth-700 mb-2">Table Restaurant (FCFA / Unité)</label>
                <input 
                  type="number"
                  value={rates.restaut}
                  onChange={e => setRates({ ...rates, restaut: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-ocean-500 outline-none"
                />
              </div>
              <button 
                onClick={handleUpdateRates}
                disabled={loading}
                className="w-full py-4 bg-ocean-500 text-white rounded-xl font-bold hover:bg-ocean-600 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> {loading ? 'Mise à jour...' : 'Enregistrer les Tarifs'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl border border-cream-200 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-earth-900 mb-8 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-ocean-500" /> Horaires d'Ouverture
            </h2>
            <div className="space-y-4">
              {Object.entries(dayLabels).map(([key, label]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-cream-50 rounded-2xl border border-cream-100">
                  <div className="font-bold text-earth-800">{label}</div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={openingHours[key]?.isClosed} 
                        onChange={e => handleDayChange(key, 'isClosed', e.target.checked)}
                        className="w-5 h-5 rounded border-cream-300 text-ocean-500 focus:ring-ocean-500"
                      />
                      <span className="text-sm font-medium text-earth-600">Fermé</span>
                    </label>
                  </div>
                  {!openingHours[key]?.isClosed && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-earth-500 uppercase font-bold">Ouverture</span>
                        <input 
                          type="time" 
                          value={openingHours[key]?.open} 
                          onChange={e => handleDayChange(key, 'open', e.target.value)}
                          className="px-3 py-2 bg-white border border-cream-200 rounded-lg text-sm focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-earth-500 uppercase font-bold">Fermeture</span>
                        <input 
                          type="time" 
                          value={openingHours[key]?.close} 
                          onChange={e => handleDayChange(key, 'close', e.target.value)}
                          className="px-3 py-2 bg-white border border-cream-200 rounded-lg text-sm focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="pt-6">
                <button 
                  onClick={handleUpdateSchedule}
                  disabled={loading}
                  className="w-full py-4 bg-ocean-500 text-white rounded-xl font-bold hover:bg-ocean-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-ocean-500/20"
                >
                   <Save className="w-5 h-5" /> {loading ? 'Enregistrement...' : 'Enregistrer les Horaires'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-earth-900 flex items-center gap-3">
              <Star className="w-6 h-6 text-ocean-500" /> Gestion des Avis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminReviews.map((review: any) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-earth-900">{review.name}</div>
                        <div className="text-xs text-earth-500">{review.role}</div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-cream-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-earth-700 italic mb-6">"{review.content}"</p>
                  </div>
                  <div className="flex gap-2 border-t border-cream-100 pt-4">
                    {review.status !== 'approved' && (
                      <button 
                        onClick={() => updateReviewStatus(review.id, 'approved')}
                        className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Approuver
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button 
                        onClick={() => updateReviewStatus(review.id, 'rejected')}
                        className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Rejeter
                      </button>
                    )}
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      review.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      review.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {review.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {adminReviews.length === 0 && (
              <div className="text-center py-20 text-earth-500">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Aucun avis à afficher pour le moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-8">
            {/* Ticket Validation Section */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
               <h2 className="text-xl font-bold flex items-center gap-3 mb-6 font-serif">
                 <Check className="w-6 h-6 text-green-500" /> Valider un Ticket
               </h2>
               <form onSubmit={handleValidateTicket} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 text-earth-600">Code de référence (6 caractères)</label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={searchCode}
                      onChange={e => setSearchCode(e.target.value.toUpperCase())}
                      placeholder="EX: A1B2C3"
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 font-mono text-lg uppercase"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || searchCode.length < 6}
                    className="bg-ocean-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-ocean-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? '...' : 'Vérifier & Valider'}
                  </button>
               </form>

               <AnimatePresence>
                 {validationResult && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mt-6 p-4 rounded-xl border ${validationResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                   >
                     <div className="flex justify-between items-center">
                        <p className="font-bold">{validationResult.message}</p>
                        <button onClick={() => setValidationResult(null)}><X className="w-4 h-4" /></button>
                     </div>
                     {validationResult.reservation && (
                       <div className="mt-2 text-sm">
                         <p>Client: {validationResult.reservation.client_name}</p>
                         <p>Service: {validationResult.reservation.type.toUpperCase()}</p>
                         <p>Date: {format(new Date(validationResult.reservation.date), 'dd/MM/yyyy')}</p>
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>

            {/* History Table Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
               <div className="p-8 border-b border-cream-100 flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                    <TableIcon className="w-6 h-6 text-gold-500" /> Historique Détailé
                  </h2>
                  <div className="flex gap-3">
                    <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                       <FileText className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                       <Download className="w-4 h-4" /> Excel
                    </button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-cream-50 text-earth-500 text-xs uppercase tracking-wider">
                     <tr>
                       <th className="px-6 py-4 font-bold">Code</th>
                       <th className="px-6 py-4 font-bold">Client</th>
                       <th className="px-6 py-4 font-bold">Service</th>
                       <th className="px-6 py-4 font-bold">Date</th>
                       <th className="px-6 py-4 font-bold">Statut</th>
                       <th className="px-6 py-4 font-bold">Montant</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-cream-100">
                     {reservations.map((r) => (
                       <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                         <td className="px-6 py-4 font-mono font-bold text-ocean-600">{r.ticket_code}</td>
                         <td className="px-6 py-4">
                           <p className="font-bold">{r.client_name}</p>
                           <p className="text-xs text-earth-500">{r.client_phone}</p>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${r.type === 'restaut' ? 'bg-orange-100 text-orange-600' : r.type === 'studio' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                             {r.type}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-sm">
                           {format(new Date(r.date), 'dd/MM/yyyy')}
                           <br/>
                           <span className="text-[10px] text-earth-400">{r.start_time} {r.end_time ? `- ${r.end_time}` : ''}</span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${r.status === 'paid' ? 'bg-blue-500' : r.status === 'validated' ? 'bg-green-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                             <span className="text-sm font-medium capitalize">{r.status}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 font-bold text-sm">{r.total_amount} FCFA</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               {reservations.length === 0 && (
                 <div className="text-center py-20 text-earth-500 italic">Aucune réservation pour le moment.</div>
               )}
            </section>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-12">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6"><ImageIcon className="w-6 h-6 text-gold-500" /> Logo du Site</h2>
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2 text-earth-700">URL de l'image (Logo)</label>
                    <input 
                      type="text" 
                      value={logo}
                      onChange={e => setLogo(e.target.value)}
                      className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                </div>
                <div className="w-16 h-16 shrink-0 rounded-lg border border-cream-300 overflow-hidden bg-cream-50 flex items-center justify-center">
                    {logo ? <img src={logo} alt="Logo preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-earth-500" />}
                </div>
              </div>
            </section>
            
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6"><ImageIcon className="w-6 h-6 text-gold-500" /> Images du Site</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(images).map(([key, url]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-earth-700 capitalize">{key.replace('_', ' ')}</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={url as string}
                        onChange={e => setImages(prev => ({ ...prev, [key]: e.target.value }))}
                        className="flex-1 w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      />
                      <div className="w-12 h-12 shrink-0 rounded-md border border-cream-300 overflow-hidden bg-cream-50">
                        <img src={url as string} alt={key} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

             <section className="bg-white p-8 rounded-2xl shadow-sm border border-cream-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3"><Plus className="w-6 h-6 text-gold-500" /> Sections Dynamiques</h2>
                <button 
                  onClick={() => setDynamicSections(prev => [...prev, { id: Date.now().toString(), title: 'Nouvelle Section', content: 'Contenu ici' }])}
                   className="flex items-center gap-2 bg-ocean-500 text-white px-4 py-2 rounded-lg hover:bg-ocean-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Ajouter Section
                </button>
              </div>
              <div className="space-y-6">
                {dynamicSections.map(section => (
                  <div key={section.id} className="p-6 bg-cream-50 border border-cream-200 rounded-xl flex flex-col gap-4 relative">
                    <button onClick={() => setDynamicSections(prev => prev.filter(s => s.id !== section.id))} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    <input value={section.title} onChange={e => setDynamicSections(prev => prev.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))} className="w-full px-4 py-2 bg-white border border-cream-300 rounded-lg" />
                    <textarea value={section.content} onChange={e => setDynamicSections(prev => prev.map(s => s.id === section.id ? { ...s, content: e.target.value } : s))} rows={4} className="w-full px-4 py-2 bg-white border border-cream-300 rounded-lg" />
                  </div>
                ))}
              </div>
            </section>
            
            <div className="pt-6">
              <button 
                onClick={handleSaveToDB}
                disabled={loading}
                className="w-full py-4 bg-ocean-500 text-white rounded-xl font-bold hover:bg-ocean-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-ocean-500/20"
              >
                 <Save className="w-5 h-5" /> {loading ? 'Enregistrement...' : 'Enregistrer le Contenu'}
              </button>
            </div>
          </div>
        )}
      </div>
      {renderAlertModal()}
    </div>
  );
}
