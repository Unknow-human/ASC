import React, { useEffect } from 'react';
import { useI18n } from './i18n';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPage() {
  const { t, lang } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = lang === 'fr' ? (
    <>
      <p className="mb-4">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      
      <h3 className="text-xl font-bold mt-8 mb-4">1. Introduction</h3>
      <p className="mb-4">
        Bienvenue sur Africa Sound City. Nous attachons une grande importance à la confidentialité de vos données. Cette politique explique comment nous recueillons, utilisons et protégeons vos informations.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">2. Collecte des données</h3>
      <p className="mb-4">
        Nous pouvons collecter des informations telles que votre nom, adresse e-mail et comportement de navigation lorsque vous interagissez avec notre site web (ex. soumission d'avis).
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">3. Utilisation des données</h3>
      <p className="mb-4">
        Les données recueillies sont utilisées pour :
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>Améliorer l'expérience utilisateur sur notre site.</li>
        <li>Répondre à vos demandes et afficher vos avis.</li>
        <li>Analyser le trafic du site pour optimiser nos services.</li>
      </ul>

      <h3 className="text-xl font-bold mt-8 mb-4">4. Partage des données</h3>
      <p className="mb-4">
        Nous ne vendons ni ne louons vos informations personnelles à des tiers. Vos données peuvent être partagées uniquement pour répondre à des obligations légales.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">5. Sécurité</h3>
      <p className="mb-4">
        Nous mettons en œuvre des mesures de sécurité pour protéger vos données contre tout accès non autorisé.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">6. Vos droits</h3>
      <p className="mb-4">
        Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles. Pour exercer ces droits, veuillez nous contacter.
      </p>
    </>
  ) : (
    <>
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US')}</p>
      
      <h3 className="text-xl font-bold mt-8 mb-4">1. Introduction</h3>
      <p className="mb-4">
        Welcome to Africa Sound City. We value your privacy. This policy explains how we collect, use, and protect your information.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">2. Data Collection</h3>
      <p className="mb-4">
        We may collect information such as your name, email address, and browsing behavior when you interact with our website (e.g., submitting reviews).
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">3. Use of Data</h3>
      <p className="mb-4">
        The collected data is used to:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>Improve user experience on our site.</li>
        <li>Respond to your requests and display your reviews.</li>
        <li>Analyze site traffic to optimize our services.</li>
      </ul>

      <h3 className="text-xl font-bold mt-8 mb-4">4. Data Sharing</h3>
      <p className="mb-4">
        We do not sell or rent your personal information to third parties. Your data may be shared only to comply with legal obligations.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">5. Security</h3>
      <p className="mb-4">
        We implement security measures to protect your data against unauthorized access.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">6. Your Rights</h3>
      <p className="mb-4">
        You have the right to access, modify, or delete your personal data. To exercise these rights, please contact us.
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-50 text-earth-900 font-sans selection:bg-ocean-500 selection:text-white">
      <nav className="bg-cream-100/90 backdrop-blur-xl py-4 border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-earth-700 hover:text-earth-900 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            {lang === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </Link>
        </div>
      </nav>
      
      <main className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-cream-200"
          >
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-earth-900 mb-8 pb-4 border-b border-cream-200">
              {t.footer.privacy}
            </h1>
            <div className="text-earth-800 leading-relaxed font-light text-base md:text-lg">
              {content}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
