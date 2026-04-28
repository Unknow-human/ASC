import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Music, MicVocal, SlidersHorizontal, BookOpen, Globe, ArrowRight, 
  Facebook, Instagram, Youtube, Menu, X, Star, Clock, MapPin, Quote, Images, Phone,
  CheckCircle2, ArrowLeft, Check, Mail, Calendar, User, Hash, AlertCircle, Loader2, Utensils, Plus,
  ChevronUp, Send, MessageSquarePlus
} from 'lucide-react';
import { useI18n } from './i18n';
import { supabase } from './supabase';
import { config } from './content';
import { useConfig } from './ConfigContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, parse, isAfter } from 'date-fns';

// --- Shared Components ---

const FadeIn = ({ children, delay = 0, className = "", duration = 0.8, ...props }: { children: React.ReactNode, delay?: number, className?: string, duration?: number, [key: string]: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// --- Reservation Modal ---

const ReservationModal = ({ isOpen, onClose, initialType = 'salle' }: { isOpen: boolean, onClose: () => void, initialType?: string }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: initialType,
    client_name: '',
    client_email: '',
    client_phone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '12:00',
    table_count: 1,
  });
  const [rates, setRates] = useState<any>({ salle: 15000, studio: 10000, restaut: 2000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{ available: boolean, message?: string, suggestions?: any[] } | null>(null);
  const [paymentData, setPaymentData] = useState<{ url: string, id: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/config').then(resp => {
        if (resp.data.rates) setRates(resp.data.rates);
      });
      setFormData(prev => ({ ...prev, type: initialType }));
      setStep(1);
      setError(null);
      setPaymentData(null);
    }
  }, [isOpen, initialType]);

  const validateForm = () => {
    if (!formData.client_name.trim()) return "Veuillez entrer votre nom.";
    if (!formData.client_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Veuillez entrer un email valide.";
    if (!formData.client_phone.trim()) return "Veuillez entrer votre téléphone.";
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) return "Vous ne pouvez pas réserver dans le passé.";

    if (formData.type !== 'restaut') {
      const start = parse(formData.start_time, 'HH:mm', new Date());
      const end = parse(formData.end_time, 'HH:mm', new Date());
      if (!isAfter(end, start)) return "L'heure de fin doit être après l'heure de début.";
    }
    return null;
  };

  const calculateTotal = () => {
    if (formData.type === 'restaut') {
      return formData.table_count * rates.restaut;
    }
    const start = parse(formData.start_time, 'HH:mm', new Date());
    const end = parse(formData.end_time, 'HH:mm', new Date());
    const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return Math.ceil(hours * rates[formData.type]);
  };

  const checkAvailability = async () => {
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await axios.post('/api/check-availability', formData);
      setAvailability(resp.data);
      if (resp.data.available) {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/reservations', formData);
      if (resp.data.payment_url) {
        setPaymentData({ url: resp.data.payment_url, id: resp.data.id });
        setStep(4);
        window.open(resp.data.payment_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!paymentData) return;
    setLoading(true);
    try {
      const resp = await axios.get(`/api/reservations/${paymentData.id}/verify-payment`);
      if (resp.data.status === 'paid' || resp.data.status === 'validated') {
        setStep(5);
      } else {
        setError('Le paiement n\'a pas encore été finalisé.');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la vérification.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-earth-900">
              {step === 1 ? 'Détails de réservation' : step === 2 ? 'Disponibilité' : step === 3 ? 'Validation' : step === 4 ? 'Paiement FedaPay' : 'Succès'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Service</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="salle">Location de Salle</option>
                    <option value="studio">Réservation Studio</option>
                    <option value="restaut">Réservation Restaurant</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nom complet</label>
                  <input 
                    type="text" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                    placeholder="Votre nom"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Email</label>
                   <input 
                    type="email" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                    placeholder="email@example.com"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Téléphone</label>
                   <input 
                    type="tel" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                    placeholder="Numéro"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                {formData.type !== 'restaut' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Début</label>
                      <input 
                        type="time" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fin</label>
                      <input 
                        type="time" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre de tables</label>
                    <input 
                      type="number" min="1" max="5" className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50"
                      value={formData.table_count}
                      onChange={(e) => setFormData({ ...formData, table_count: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>
              <button 
                onClick={checkAvailability}
                disabled={loading || !formData.client_name || !formData.client_email}
                className="w-full py-4 mt-6 bg-ocean-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-ocean-600 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Vérifier la disponibilité'}
              </button>
            </div>
          )}

          {step === 2 && availability && (
             <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-earth-900 mb-2">{availability.message}</h3>
                <p className="text-earth-600 mb-6 font-light">Veuillez choisir un autre créneau ou essayer une des propositions suivantes :</p>
                <div className="space-y-3">
                  {availability.suggestions?.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setFormData({ ...formData, ...s });
                        setStep(1);
                      }}
                      className="w-full p-4 border border-ocean-200 rounded-2xl flex items-center justify-between hover:bg-ocean-50 transition-colors group"
                    >
                       <div className="text-left">
                          <p className="font-bold text-ocean-600">{format(new Date(s.date), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-earth-500">
                             {s.start_time ? `${s.start_time} - ${s.end_time}` : 'Journée complète'}
                          </p>
                       </div>
                       <ArrowRight className="w-5 h-5 text-ocean-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="mt-8 text-ocean-500 font-bold hover:underline"
                >
                  Retour au formulaire
                </button>
             </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-earth-900 mb-2">C'est disponible !</h3>
              <p className="text-earth-600 mb-6 font-light">
                Vous recevrez votre ticket avec code de référence par email après le paiement.
              </p>
              
              <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 text-left mb-8">
                 <div className="flex justify-between mb-2">
                    <span className="text-earth-500">Service :</span>
                    <span className="font-bold uppercase">{formData.type}</span>
                 </div>
                 <div className="flex justify-between mb-2">
                    <span className="text-earth-500">Date :</span>
                    <span className="font-bold">{format(new Date(formData.date), 'dd/MM/yyyy')}</span>
                 </div>
                 <div className="flex justify-between border-t border-cream-200 pt-2 mt-2">
                    <span className="text-earth-900 font-bold">Total :</span>
                    <span className="text-ocean-600 font-bold text-xl">
                       {new Intl.NumberFormat('fr-FR').format(calculateTotal())} FCFA
                    </span>
                 </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={loading}
                className="w-full py-4 bg-ocean-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-ocean-600 transition-all shadow-xl shadow-ocean-500/30"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <Globe className="w-5 h-5" />
                    Ouvrir la page de paiement
                  </>
                )}
              </button>
            </div>
          )}

          {step === 4 && paymentData && (
            <div className="space-y-8 text-center py-4">
               <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                  <Globe className="w-12 h-12 text-blue-500" />
               </div>
               
               <div>
                 <h3 className="text-2xl font-bold font-serif text-earth-900 mb-3">Paiement en cours</h3>
                 <p className="text-earth-600">
                   Une nouvelle fenêtre a été ouverte pour sécuriser votre paiement.<br/>
                   Une fois le paiement terminé, cliquez sur le bouton ci-dessous.
                 </p>
               </div>

               <div className="flex flex-col gap-4">
                 <button 
                   onClick={verifyPayment}
                   disabled={loading}
                   className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/30"
                 >
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                     <>
                        <Check className="w-5 h-5" /> J'ai terminé mon paiement
                     </>
                   )}
                 </button>
                 <a 
                   href={paymentData.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full py-4 bg-white border-2 border-ocean-500 text-ocean-600 rounded-xl font-bold hover:bg-ocean-50 transition-colors block"
                 >
                   Rouvrir la page de paiement
                 </a>
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-6">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-200">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
               </div>
               
               <h3 className="text-2xl font-bold font-serif text-earth-900">Paiement réussi !</h3>
               <p className="text-earth-600">
                 Votre réservation a été confirmée avec succès. Vous recevrez bientôt un e-mail avec vos informations.
               </p>
               
               <button 
                 onClick={onClose}
                 className="w-full py-4 bg-earth-900 text-gold-400 rounded-xl font-bold hover:bg-earth-800 transition-colors mt-4"
               >
                 Fermer
               </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-ocean-500 text-white rounded-full shadow-2xl hover:bg-ocean-600 transition-all group"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// --- Sections ---

const ClosingCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOpeningSoon, setIsOpeningSoon] = useState(false);
  const { openingHours } = useConfig();
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentDay = dayKeys[now.getDay()];
      const hours = openingHours[currentDay];

      if (!hours || hours.isClosed) {
        setTimeLeft('Fermé aujourd\'hui');
        setIsOpeningSoon(false);
        return;
      }

      const [openH, openM] = hours.open.split(':').map(Number);
      const [closeH, closeM] = hours.close.split(':').map(Number);

      const openingTime = new Date();
      openingTime.setHours(openH, openM, 0, 0);

      const closingTime = new Date();
      closingTime.setHours(closeH, closeM, 0, 0);

      if (now < openingTime) {
        const diff = openingTime.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Ouverture dans ${h}h ${m}m ${s}s`);
        setIsOpeningSoon(true);
      } else if (now > closingTime) {
        setTimeLeft('Fermé (Réouverture demain)');
        setIsOpeningSoon(false);
      } else {
        const diff = closingTime.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Fermeture dans ${h}h ${m}m ${s}s`);
        setIsOpeningSoon(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [openingHours]);

  return (
    <div className={`${isOpeningSoon ? 'bg-amber-600' : 'bg-ocean-600'} text-cream-50 text-[10px] md:text-sm font-medium py-1.5 px-4 text-center z-[60] relative uppercase tracking-widest transition-colors duration-500`}>
      {timeLeft}
    </div>
  );
};

const Navbar = ({ isExpanded }: { isExpanded: boolean }) => {
  const { lang, setLang, t } = useI18n();
  const { logo } = useConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <ClosingCountdown />
      <nav className={`w-full transition-all duration-500 ease-out ${scrolled || isExpanded ? 'bg-cream-50/90 backdrop-blur-xl py-3 border-b border-cream-200' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <button onClick={(e) => scrollToSection(e, 'hero')} className="flex items-center gap-3 group focus:outline-none rounded-full pr-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-cream-100 shadow-sm border-2 border-cream-200 transform group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Africa Sound City Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-earth-900 hidden sm:block">
              Africa Sound City
            </span>
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            {['about', 'services', 'gallery', 'reviews'].map((section) => (
               <a 
                key={section} 
                href={`#${section}`} 
                onClick={(e) => scrollToSection(e, section)} 
                className="text-earth-800 hover:text-ocean-500 font-medium transition-colors text-sm uppercase tracking-widest relative group"
              >
                {t.nav[section as keyof typeof t.nav]}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-ocean-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            
            <div className="w-px h-6 bg-cream-300 mx-2"></div>

            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 text-earth-800 hover:text-ocean-500 transition-colors font-semibold group rounded-full focus:outline-none"
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm uppercase tracking-widest">{lang}</span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-5">
             <button onClick={toggleLang} className="flex items-center gap-1 text-earth-800 font-bold focus:outline-none">
              <Globe className="w-5 h-5" />
              <span className="text-sm uppercase">{lang}</span>
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-earth-900 p-2 bg-cream-50 rounded-full shadow-sm focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-cream-50/95 backdrop-blur-xl pt-28 px-6 md:hidden overflow-y-auto pb-10"
          >
            <div className="flex flex-col gap-8 text-center mt-4">
              {['about', 'services', 'gallery', 'reviews'].map((section, i) => (
                <motion.a 
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={`#${section}`} 
                  onClick={(e) => scrollToSection(e, section)} 
                  className="font-serif text-3xl font-medium text-earth-900 hover:text-ocean-500 transition-colors"
                >
                  {t.nav[section as keyof typeof t.nav]}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  const { t } = useI18n();
  const { images } = useConfig();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="hero" className="relative pt-24 pb-16 md:pt-40 md:pb-32 overflow-hidden bg-cream-100 min-h-[85vh] flex items-center">
      <ReservationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${images.heroBg})`,
          opacity: 0.15 
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100/50 via-cream-100/20 to-cream-100 z-0"></div>
      
      <div className="absolute inset-0 bg-pattern z-0 opacity-40"></div>
      
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gold-400/5 rounded-full blur-3xl -translate-y-1/2 -z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          <div className="lg:col-span-6 max-w-2xl text-center lg:text-left">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50/80 backdrop-blur-sm text-gold-600 font-medium text-xs md:text-sm mb-6 border border-gold-400/20 shadow-sm mx-auto lg:mx-0">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                {t.hero.badge}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-earth-900 tracking-tight">
                {t.hero.title}
              </h1>
            </FadeIn>
            <FadeIn delay={0.2} className="lg:pl-4 lg:border-l-2 lg:border-ocean-500/30">
              <p className="text-earth-800/80 text-base md:text-lg lg:text-xl leading-relaxed mb-8 max-w-xl font-light mx-auto lg:mx-0">
                {t.hero.desc}
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-3 bg-gold-400 hover:bg-gold-500 text-earth-900 px-8 py-4 rounded-full font-bold shadow-lg shadow-gold-500/20 transition-all duration-300 hover:-translate-y-0.5 text-base group"
                >
                  <Calendar className="w-5 h-5" /> Réserver Maintenant
                </button>
                <a 
                  href="#services"
                  className="inline-flex items-center justify-center gap-3 bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-ocean-500/20 transition-all duration-300 hover:-translate-y-0.5 text-base group"
                >
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-6 relative hidden lg:block h-[600px]">
            <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-10/12 h-[400px] z-10">
              <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-cream-50 relative group">
                <div className="absolute inset-0 bg-earth-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src={t.services.items.live.cover} 
                  alt="Concert Live"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>
            <motion.div style={{ y: y2 }} className="absolute bottom-10 left-0 w-8/12 h-[350px] z-20">
              <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-cream-50 relative group">
                <div className="absolute inset-0 bg-earth-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img 
                  src={t.services.items.masterclass.cover} 
                  alt="Acoustic Instruments" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const { t } = useI18n();
  const { images } = useConfig();
  return (
    <section id="about" className="py-24 bg-cream-50 relative border-y border-cream-200 overflow-hidden">
      <div className="absolute top-10 right-10 md:top-20 md:right-20 opacity-5 pointer-events-none">
        <Music className="w-64 h-64 md:w-96 h-[auto] text-earth-900 rotate-12" />
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <FadeIn className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="uppercase tracking-[0.2em] text-ocean-500 font-bold text-sm md:text-base mb-6">
            {t.about.title}
          </h2>
          <h3 className="font-serif text-3xl md:text-4xl font-bold text-earth-900 mb-6">
            {t.about.subtitle}
          </h3>
          <p className="text-earth-800/80 text-lg md:text-xl font-light leading-relaxed px-4 md:px-0">
            {t.about.desc}
          </p>
          <div className="flex justify-center mt-8">
            <div className="w-16 h-1 bg-gold-400 rounded-full"></div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mt-16">
          {t.about.sections.map((section: any, idx: number) => (
            <FadeIn key={idx} delay={0.1 * idx} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-600 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl font-bold text-earth-900">{section.title}</h4>
              </div>
              <p className="text-earth-700 leading-relaxed font-light pl-14">
                {section.content}
              </p>
            </FadeIn>
          ))}
        </div>
        
        <FadeIn delay={0.4} className="mt-20 flex flex-col md:flex-row items-center gap-12 bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-cream-200">
           <div className="w-full md:w-5/12 aspect-[4/3] rounded-2xl overflow-hidden relative shadow-md">
             <img src={images.about_1} alt="About Us" className="w-full h-full object-cover" />
           </div>
           <div className="w-full md:w-7/12 flex flex-col gap-6">
              <h3 className="font-serif text-2xl font-bold text-earth-900">Une Histoire de Passion</h3>
              <p className="text-earth-700 leading-relaxed font-light">
                Chaque semaine à Africa Sound City est une célébration. Que ce soit pour un de nos célèbres "Live Experience", un spectacle de Jazz Fusion, ou un atelier consacré au Slam et à l'éloquence, notre agenda est conçu pour surprendre et inspirer. Nous vous invitons à participer et à faire résonner votre voix dans ce lieu d'exception.
              </p>
           </div>
        </FadeIn>
      </div>
    </section>
  );
};

const Services = () => {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('salle');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const openBooking = (type: string) => {
    setSelectedType(type);
    setModalOpen(true);
  };

  const activeServiceData = selectedService 
    ? t.services.items[selectedService as keyof typeof t.services.items] 
    : null;

  return (
    <section id="services" className="py-24 bg-cream-100 relative">
      <ReservationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialType={selectedType} 
      />

      <AnimatePresence>
        {selectedService && activeServiceData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-md"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              layoutId={`service-card-${selectedService}`}
              className="bg-cream-50 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedService(null)} 
                className="absolute top-6 right-6 z-30 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col md:flex-row h-full max-h-[85vh] md:h-[600px] overflow-hidden">
                {/* Image Section */}
                <div className="w-full md:w-1/2 h-[250px] md:h-full relative shrink-0">
                  <motion.img 
                    layoutId={`service-image-${selectedService}`}
                    src={activeServiceData.cover} 
                    className="w-full h-full object-cover absolute inset-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-900/60 to-transparent md:hidden" />
                </div>
                
                {/* Content Section */}
                <div className="w-full md:w-1/2 flex flex-col bg-cream-50 overflow-hidden relative">
                  <div className="p-8 md:p-12 overflow-y-auto flex-1 pb-24 md:pb-32">
                    <motion.div layoutId={`service-card-inner-${selectedService}`}>
                      <h2 className="font-serif text-3xl font-bold text-earth-900 mb-4">{activeServiceData.title}</h2>
                      <p className="text-ocean-600 font-bold mb-6">{activeServiceData.desc}</p>
                    </motion.div>
                    
                    <p className="text-earth-800 font-light leading-relaxed mb-8">{activeServiceData.longDesc}</p>
                    
                    <h4 className="font-serif font-bold text-lg text-earth-900 mb-4">Ce qui est inclus :</h4>
                    <ul className="space-y-3 mb-8">
                       {(activeServiceData.features || []).map((f: string, i: number) => (
                         <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-gold-400/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-gold-600" />
                            </div>
                            <span className="text-earth-800 text-sm font-medium">{f}</span>
                         </li>
                       ))}
                    </ul>
                  </div>
                  
                  {/* Sticky Button Area */}
                  <div className="absolute flex bottom-0 w-full p-6 bg-gradient-to-t from-cream-50 via-cream-50 to-transparent">
                    <button 
                      onClick={() => {
                          setSelectedService(null);
                          // Map activity keys to booking types if applicable
                          const mapping: Record<string, string> = { salle: 'salle', studio: 'studio', restaut: 'restaut' };
                          openBooking(mapping[selectedService] || 'salle');
                      }}
                      className="w-full py-4 mt-4 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl font-bold shadow-lg shadow-ocean-500/20 transition-all"
                    >
                      Réserver cet espace
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="flex flex-col mb-16 max-w-2xl">
          <FadeIn>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-earth-900 mb-6 tracking-tight">
              Réservations & Tarifs
            </h2>
            <p className="text-earth-800/80 text-lg md:text-xl font-light leading-relaxed">
              Planifiez votre venue. Nos tarifs sont transparents et s'ajustent à vos besoins (par heure ou par table).
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24 auto-rows-auto md:auto-rows-[300px]">
          {/* Salle */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            onClick={() => openBooking('salle')}
            className="md:col-span-8 bg-cream-50 rounded-[2rem] p-8 md:p-12 border border-cream-200 shadow-sm relative overflow-hidden group flex flex-col justify-end cursor-pointer min-h-[350px] md:min-h-0"
          >
            {/* FIXED SOUND WAVE DESIGN */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
               <div className="absolute top-0 right-0 w-[150%] h-[150%] md:w-[600px] md:h-[600px] bg-ocean-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 md:translate-x-1/3 group-hover:scale-110 transition-transform duration-1000"></div>
               {/* Visual waves decoration */}
               <div className="absolute top-10 right-10 flex gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-ocean-500 rounded-full" style={{ height: `${20 + Math.random() * 40}px`, animation: `pulse ${1 + Math.random()}s infinite ease-in-out` }} />
                  ))}
               </div>
            </div>
            
            <div className="relative z-10 max-w-lg">
              <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-cream-200 backdrop-blur-sm">
                <Music className="w-7 h-7 text-ocean-500" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-earth-900 mb-3 group-hover:text-ocean-500 transition-colors">Location de Salle</h3>
              <p className="text-earth-800/80 text-base md:text-lg font-light leading-relaxed">Espace acoustique idéal pour vos événements et concerts. Tarif à l'heure.</p>
              <div className="mt-6 flex items-center gap-2 text-ocean-500 font-bold text-sm md:text-base">
                 Calculer mon tarif <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          <div className="md:col-span-4 grid gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => openBooking('studio')}
              className="bg-earth-900 text-cream-50 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-end group cursor-pointer min-h-[250px]"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-earth-900/40 to-transparent z-10"></div>
               {/* Image removed for cleaner focus on Salle per user request */}
               <div className="relative z-20">
                 <SlidersHorizontal className="w-8 h-8 text-gold-400 mb-4" />
                 <h3 className="font-serif text-xl font-bold mb-2">Studio Recording</h3>
                 <p className="text-cream-200/70 text-sm font-light">Espace professionnel de mixage et production.</p>
                 <div className="mt-4 flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-widest">
                    Vérifier tarifs <ArrowRight className="w-3 h-3" />
                 </div>
               </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => openBooking('restaut')}
              className="bg-cream-100 border border-gold-400/30 rounded-[2rem] p-8 shadow-lg relative overflow-hidden flex flex-col justify-end group cursor-pointer min-h-[250px]"
            >
               <div className="absolute inset-0 bg-gold-400/5 z-0"></div>
               {/* Image removed for cleaner focus on Salle per user request */}
               <div className="relative z-10">
                 <Utensils className="w-8 h-8 text-earth-900 mb-4" />
                 <h3 className="font-serif text-xl font-bold text-earth-900 mb-2">Table Restaurant</h3>
                 <p className="text-earth-900/70 text-sm font-medium">Réservez votre table pour savourer nos mets.</p>
                 <div className="mt-4 flex items-center gap-2 text-earth-900 font-bold text-xs uppercase tracking-widest opacity-60">
                    Calculer prix <ArrowRight className="w-3 h-3" />
                 </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Nos Activités Section */}
        <div id="activities" className="mt-40">
          <div className="flex flex-col mb-16 max-w-2xl">
            <FadeIn>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-earth-900 mb-6 tracking-tight">
                {t.services.title}
              </h2>
              <p className="text-earth-800/80 text-lg md:text-xl font-light leading-relaxed">
                {t.services.desc}
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px] md:auto-rows-[250px]">
            {Object.entries(t.services.items).map(([key, item]: [string, any], idx) => {
              // Artistic grid mapping
              const gridConfig: Record<number, string> = {
                0: "md:col-span-7 md:row-span-2", // Live Experience (Main)
                1: "md:col-span-5 md:row-span-1", // Restaurant (Side)
                2: "md:col-span-5 md:row-span-1", // Studio (Side)
                3: "md:col-span-4 md:row-span-1", // Cultural (Small)
                4: "md:col-span-4 md:row-span-1", // Masterclass (Small)
                5: "md:col-span-4 md:row-span-1", // Art Gallery (Small)
              };
              
              const isMain = idx === 0;

              return (
                <motion.div 
                  key={key}
                  layoutId={`service-card-${key}`}
                  onClick={() => setSelectedService(key)}
                  className={`${gridConfig[idx] || "md:col-span-4"} group relative rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20`}
                >
                   {/* High contrast overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-earth-900/95 via-earth-900/40 to-transparent z-10 opacity-70 group-hover:opacity-60 transition-opacity"></div>
                   
                   <motion.img 
                    layoutId={`service-image-${key}`}
                    src={item.cover} 
                    className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" 
                    referrerPolicy="no-referrer"
                  />
                  
                   <div className={`relative z-20 h-full p-8 flex flex-col ${isMain ? 'justify-end' : 'justify-end md:justify-center lg:justify-end'}`}>
                     <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                       <h3 className={`font-serif ${isMain ? 'text-3xl md:text-4xl' : 'text-xl'} font-bold text-white mb-2 leading-tight drop-shadow-lg`}>
                        {item.title}
                       </h3>
                       <p className={`text-cream-50/90 ${isMain ? 'text-base' : 'text-xs'} font-light mb-6 line-clamp-2 max-w-md`}>
                        {item.desc}
                       </p>
                       
                       <div className="flex flex-wrap gap-3">
                         <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-white hover:text-earth-900 transition-all">
                            Détails <ArrowRight className="w-3.5 h-3.5" />
                         </div>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             const mapping: Record<string, string> = { live: 'salle', studio: 'studio', lifestyle: 'restaut' };
                             openBooking(mapping[key] || 'salle');
                           }}
                           className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-400 rounded-full text-earth-900 text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-gold-500 transition-all shadow-lg shadow-gold-500/20"
                         >
                           Réserver
                         </button>
                       </div>
                     </div>
                   </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Visual divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cream-300 to-transparent w-full"></div>
      </div>

    </section>
  );
};

const GalleryItem = ({ item, delay, ...props }: { item: any, delay: number, [key: string]: any }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: "100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative overflow-hidden rounded-[2rem] group ${item.span} min-h-[300px] shadow-sm cursor-pointer border border-earth-900/5`}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-earth-900/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700 z-10" />
    <motion.img
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      src={item.src}
      alt={item.title}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="w-full h-full object-cover absolute inset-0"
    />
    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
       <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-gold-400 rounded-full inline-block shadow-[0_0_8px_rgba(224,188,72,0.8)]"></span>
            <h4 className="font-serif text-xl md:text-2xl font-bold text-cream-50">{item.title}</h4>
          </div>
          <p className="text-cream-200/90 text-sm md:text-base leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-sm font-light">
            {item.desc}
          </p>
       </div>
    </div>
  </motion.div>
);

const Gallery = () => {
  const { t } = useI18n();
  return (
    <section id="gallery" className="py-24 bg-cream-50 border-t border-cream-200 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-cream-100 rounded-full flex items-center justify-center border border-cream-300 shadow-sm">
                <Images className="w-6 h-6 text-gold-500" />
              </div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-earth-900 mb-4 tracking-tight">
              {t.gallery.title}
            </h2>
            <p className="text-earth-800/80 text-lg md:text-xl font-light leading-relaxed">
              {t.gallery.desc}
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[300px]">
           {t.gallery.items.map((item: any, idx: number) => (
             <GalleryItem key={item.id} item={{ ...item, span: item.span.replace('md:', 'lg:') }} delay={0.1 * idx} />
           ))}
        </div>

      </div>
    </section>
  );
};

const Reviews = () => {
  const { lang, t } = useI18n();
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', email: '', text: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const resp = await axios.get('/api/reviews');
        if (resp.data) {
          setLocalReviews(resp.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, []);

  const allReviews = [...localReviews, ...t.reviews.items];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.name && newReview.text && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await axios.post('/api/reviews', {
          name: newReview.name,
          role: 'Client',
          content: newReview.text,
          rating: newReview.rating
        });
        
        setNewReview({ name: '', email: '', text: '', rating: 5 });
        setShowSuccess(true);
        // Refresh
        const resp = await axios.get('/api/reviews');
        setLocalReviews(resp.data);
      } catch (error) {
        console.error('Error submitting review:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section id="reviews" className="py-24 bg-earth-900 text-cream-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-ocean-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-gold-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <FadeIn className="mb-16 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {t.reviews.title}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />)}
            </div>
            <span className="ml-3 text-cream-200 text-base font-medium bg-earth-800 px-4 py-1.5 rounded-full border border-earth-700/50">{t.reviews.rating}</span>
          </div>
          <p className="text-cream-200/80 max-w-2xl mx-auto text-lg md:text-xl font-light mb-8">{t.reviews.desc}</p>
        </FadeIn>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-6 order-2 lg:order-1">
             {allReviews.map((review: any, idx: number) => (
               <FadeIn key={idx} delay={0.1 * (idx % 2)} className="h-full">
                <div className="bg-earth-800/40 backdrop-blur-sm p-8 rounded-[2rem] border border-earth-700/50 flex flex-col justify-between hover:bg-earth-800/60 transition-all duration-500 h-full shadow-xl relative overflow-hidden group">
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-earth-700/30 group-hover:text-ocean-500/10 transition-colors duration-500" />
                  <div className="relative z-10 flex-grow">
                    <div className="flex gap-1 mb-4">
                       {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-gold-400 text-gold-400' : 'fill-earth-700 text-earth-700'}`} />
                       ))}
                    </div>
                    <p className="text-cream-100/90 leading-relaxed text-sm font-light mb-6">"{review.text || review.content}"</p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-earth-700/80 pt-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-cream-50 font-serif font-bold text-lg shadow-lg border border-ocean-400/50 uppercase">
                      {(review.author || review.authorName || review.name || '?').charAt(0)}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-cream-50 text-base tracking-wide">{review.author || review.authorName || review.name}</div>
                      <div className="text-ocean-400/80 text-[10px] font-medium tracking-wider uppercase">
                         {review.role || 'Avis Client'}
                      </div>
                    </div>
                  </div>
                </div>
               </FadeIn>
             ))}
          </div>

          {/* Review Form - Integrated */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 order-1 lg:order-2">
            <FadeIn>
              <div className="bg-cream-50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative text-earth-900 border border-white/20">
                <div className="flex items-center gap-3 mb-6 text-ocean-500">
                  <MessageSquarePlus className="w-6 h-6" />
                  <h3 className="font-serif text-2xl font-bold text-earth-900">{t.reviews.formProps.title}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-earth-500 mb-2">{t.reviews.formProps.name}</label>
                    <input 
                      required
                      type="text" 
                      value={newReview.name}
                      onChange={e => setNewReview({...newReview, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-200 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-shadow shadow-sm"
                      disabled={isSubmitting}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-earth-500 mb-2">{t.reviews.formProps.email}</label>
                    <input 
                      required
                      type="email" 
                      value={newReview.email}
                      onChange={e => setNewReview({...newReview, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-200 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition-shadow shadow-sm"
                      disabled={isSubmitting}
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div>
                     <label className="block text-[11px] uppercase tracking-widest font-bold text-earth-500 mb-2">Note de satisfaction</label>
                     <div className="flex gap-2 p-3 bg-white rounded-2xl border border-cream-200 shadow-sm">
                       {[1,2,3,4,5].map(star => (
                         <button
                           key={star}
                           type="button"
                           onClick={() => setNewReview({...newReview, rating: star})}
                           className="focus:outline-none transition-all hover:scale-110 active:scale-95"
                           disabled={isSubmitting}
                         >
                           <Star className={`w-7 h-7 ${star <= newReview.rating ? 'fill-gold-400 text-gold-400' : 'fill-cream-100 text-cream-200'}`} />
                         </button>
                       ))}
                     </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-earth-500 mb-2">{t.reviews.formProps.review}</label>
                    <textarea 
                      required
                      rows={4}
                      value={newReview.text}
                      onChange={e => setNewReview({...newReview, text: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-200 bg-white text-earth-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 shadow-sm resize-none"
                      disabled={isSubmitting}
                      placeholder="Partagez votre expérience ici..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-earth-900 hover:bg-earth-800 shadow-lg shadow-earth-900/10 transition-all disabled:opacity-50 flex justify-center items-center gap-2 group"
                    disabled={isSubmitting || !newReview.name || !newReview.email || !newReview.text}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        {t.reviews.formProps.submit}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </FadeIn>
          </div>
        </div>
        
        {showSuccess && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-cream-50 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-earth-900">
                {lang === 'fr' ? 'Merci !' : 'Thank you!'}
              </h3>
              <p className="text-earth-800/80 mb-8 font-light leading-relaxed">
                {lang === 'fr' 
                  ? 'Merci pour votre contribution ! Votre avis a été soumis avec succès.' 
                  : 'Thank you for your contribution! Your review has been submitted.'}
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 px-4 rounded-xl font-medium text-white bg-ocean-500 hover:bg-ocean-600 transition-colors"
              >
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};



const Footer = () => {
  const { t } = useI18n();
  const { openingHours, logo } = useConfig();
  return (
    <footer className="bg-cream-100 pt-20 pb-10 border-t border-cream-300 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 mb-16">
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start pr-8">
            <a href="#hero" className="flex items-center gap-3 mb-6 group overflow-visible focus:outline-none focus:ring-2 focus:ring-ocean-500 rounded-full pr-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-cream-100 shadow-sm border-2 border-cream-200 transform group-hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="Africa Sound City Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif font-bold text-2xl text-earth-900 tracking-tight">
                Africa Sound City
              </span>
            </a>
            <p className="text-earth-800/70 mb-8 text-base leading-relaxed font-light">
              {t.footer.desc}
            </p>

          </div>
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4 md:mt-0 lg:pl-16">
            <div>
              <h4 className="font-serif font-bold text-xl text-earth-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-ocean-500" />
                {t.footer.hoursTitle}
              </h4>
              <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5 shadow-sm space-y-3">
                {Object.entries(openingHours).map(([day, hours]: [string, any]) => {
                  const dayNames: any = {
                    monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
                    thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
                  };
                  return (
                    <div key={day} className="flex justify-between items-center text-sm">
                      <span className="text-earth-600 font-medium">{dayNames[day]}</span>
                      <span className={`font-bold ${hours.isClosed ? 'text-red-500' : 'text-earth-900'}`}>
                        {hours.isClosed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-serif font-bold text-xl text-earth-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-ocean-500" />
                {t.footer.locationTitle}
              </h4>
               <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5 shadow-sm">
                 <div className="flex items-start gap-3 text-earth-800/90 mb-3">
                    <MapPin className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" />
                    <div>
                      <a href="https://www.google.com/maps/search/?api=1&query=6.393372083581132,2.364583914057495" target="_blank" rel="noopener noreferrer" className="hover:text-ocean-500 transition-colors block font-medium">
                         {t.footer.locationText}<br/>
                         <span className="text-earth-500 block">{t.footer.locationCity}</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-earth-800/90 font-medium mb-3">
                    <Phone className="w-5 h-5 text-ocean-500 shrink-0" />
                    <a href={`tel:${t.footer.phone.replace(/\s/g, '')}`} className="hover:text-ocean-500 transition-colors">{t.footer.phone}</a>
                  </div>
                  {(t.footer as any).email && (
                    <div className="flex items-center gap-3 text-earth-800/90 font-medium mb-4">
                      <Mail className="w-5 h-5 text-ocean-500 shrink-0" />
                      <a href={`mailto:${(t.footer as any).email}`} className="hover:text-ocean-500 transition-colors">{(t.footer as any).email}</a>
                    </div>
                  )}
                  {/* Social links */}
                  {(t.footer as any).socials && (
                    <div className="flex gap-4 mt-6 border-t border-cream-200 pt-4">
                      {(t.footer as any).socials.facebook && (
                        <a href={(t.footer as any).socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-earth-700 hover:text-ocean-500 hover:bg-cream-200 transition-all border border-cream-200">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {(t.footer as any).socials.instagram && (
                        <a href={(t.footer as any).socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-earth-700 hover:text-ocean-500 hover:bg-cream-200 transition-all border border-cream-200">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {(t.footer as any).socials.tiktok && (
                         <a href={(t.footer as any).socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-earth-700 hover:text-ocean-500 hover:bg-cream-200 transition-all border border-cream-200">
                           {/* Using Music icon for TikTok as fallback */}
                           <Music className="w-5 h-5" />
                         </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-cream-300 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-earth-800/70 font-medium">
          <p>&copy; {new Date().getFullYear()} Africa Sound City. {t.footer.rights} <Link to="/admin" className="opacity-0 hover:opacity-10 transition-opacity ml-2">Admin</Link></p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-ocean-500 transition-colors">{t.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-ocean-500 transition-colors">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function HomePage() {
  const { t } = useI18n();
  const { dynamicSections } = useConfig();

  return (
    <div className="min-h-screen bg-cream-50 font-sans selection:bg-ocean-100 selection:text-ocean-900">
      <Navbar isExpanded={false} />
      
      <main>
        <Hero />
        <AboutSection />
        {dynamicSections.map((section: any) => (
           <section id={section.id} key={section.id} className="py-24 bg-cream-50 relative border-y border-cream-200">
             <div className="max-w-4xl mx-auto px-6 text-center">
                <FadeIn>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-earth-900 mb-8 tracking-tight">{section.title}</h2>
                  <p className="text-earth-800/80 text-lg md:text-xl font-light leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </FadeIn>
             </div>
           </section>
        ))}
        <Services />
        <Gallery />
        <Reviews />
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
}
