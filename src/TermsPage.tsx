import React, { useEffect } from 'react';
import { useI18n } from './i18n';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function TermsPage() {
  const { t, lang } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = lang === 'fr' ? (
    <>
      <p className="mb-4">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      
      <h3 className="text-xl font-bold mt-8 mb-4">1. Acceptation des conditions</h3>
      <p className="mb-4">
        En accédant à notre site web et en l'utilisant, vous acceptez les présentes conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser notre site.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">2. Utilisation du site</h3>
      <p className="mb-4">
        Le contenu de ce site est fourni à titre informatif et promotionnel. Vous vous engagez à ne pas l'utiliser à des fins illégales ou interdites par ces conditions.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">3. Propriété intellectuelle</h3>
      <p className="mb-4">
        Tous les contenus présents sur ce site (textes, images, logos, vidéos) sont la propriété de Africa Sound City ou de ses partenaires. Toute reproduction sans autorisation préalable est interdite.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">4. Contenu utilisateur</h3>
      <p className="mb-4">
        En soumettant un avis ou tout autre contenu sur notre site, vous nous accordez le droit de l'utiliser, de le modifier et de l'afficher sur nos plateformes. Vous restez responsable du contenu que vous publiez.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">5. Limitation de responsabilité</h3>
      <p className="mb-4">
        Africa Sound City ne saurait être tenue pour responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou de l'impossibilité d'y accéder.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">6. Modification des conditions</h3>
      <p className="mb-4">
        Nous nous réservons le droit de modifier ces conditions à tout moment. Il est de votre responsabilité de les consulter régulièrement.
      </p>
    </>
  ) : (
    <>
      <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-US')}</p>
      
      <h3 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h3>
      <p className="mb-4">
        By accessing and using our website, you agree to these Terms of Service. If you do not agree, please do not use our site.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">2. Use of the Site</h3>
      <p className="mb-4">
        The content of this site is for informational and promotional purposes. You agree not to use it for any illegal purposes or any purpose prohibited by these terms.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">3. Intellectual Property</h3>
      <p className="mb-4">
        All contents on this site (texts, images, logos, videos) are the property of Africa Sound City or its partners. Any reproduction without prior authorization is prohibited.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">4. User Content</h3>
      <p className="mb-4">
        By submitting a review or any other content on our site, you grant us the right to use, modify, and display it on our platforms. You remain responsible for the content you post.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">5. Limitation of Liability</h3>
      <p className="mb-4">
        Africa Sound City cannot be held liable for any direct or indirect damages resulting from the use of this site or the inability to access it.
      </p>

      <h3 className="text-xl font-bold mt-8 mb-4">6. Changes to Terms</h3>
      <p className="mb-4">
        We reserve the right to modify these terms at any time. It is your responsibility to check them regularly.
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
              {t.footer.terms}
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
