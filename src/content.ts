export type Lang = 'fr' | 'en';

export const config = {
  // Vous pouvez modifier le logo ici
  logo: "https://buffer-start-page-uploads.s3.amazonaws.com/6895d041d216dda03c7f4487/1754655118775.asc_logo_fn.jpg",
  // Vous pouvez modifier toutes les images du site ici
  images: {
    heroBg: "https://start-page.buffer.com/cdn-cgi/image/height=920/https://buffer-start-page-uploads.s3.amazonaws.com/6895d041d216dda03c7f4487/1754650075251.asc_sc%C3%A8ne_pay.jpg",
    live_1: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
    live_2: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    studio_1: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    studio_2: "https://images.unsplash.com/photo-1601643157091-ce5c665179ab?auto=format&fit=crop&w=1200&q=80",
    masterclass_1: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
    masterclass_2: "https://images.unsplash.com/photo-1460036521480-ff4afcb85823?auto=format&fit=crop&w=1200&q=80",
    lifestyle_1: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
    lifestyle_2: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    about_1: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80"
  }
};

export const getContent = (dynImages: typeof config.images) => ({
  fr: {
    nav: { home: "Accueil", about: "À Propos", services: "Activités", gallery: "Galerie", reviews: "Avis" },
    hero: {
      badge: "Centre Culturel Africain",
      title: "Vibrez au rythme de l'Excellence Africaine.",
      desc: "Découvrez Africa Sound City, le carrefour culturel qui valorise la richesse de la musique africaine. Salles de concert, studio d'enregistrement, masterclasses et espace de vie chaleureux.",
      cta: "Explorer nos activités"
    },
    about: {
      title: "À Propos de Nous",
      subtitle: "Un engagement profond pour la culture béninoise",
      desc: "Africa Sound City est bien plus qu'un simple centre, c'est un incubateur musical propulsé par la Jah Baba Association, dédié à la préservation et la promotion du patrimoine culturel et musical du Bénin.",
      sections: [
        {
          title: "L'Échange Professionnel",
          content: "Nous offrons des salles de réunion modernes équipées pour vos séminaires, ateliers de formation, et conférences. Récemment, nous avons accueilli la formation de l'Amicale des Jeunes Managers d'Artiste. Un cadre stimulant pour l'émergence de nouvelles idées."
        },
        {
          title: "La Promotion Culturelle",
          content: "Avec nos deux scènes dédiées aux événements live et une scène karaoké pour les talents de tous niveaux, Africa Sound City est le tremplin idéal. C'est ici que les voix s'élèvent et que les rythmes envoûtent."
        },
        {
          title: "La Convivialité & le Networking",
          content: "Une bibliothèque riche en livres, CDs et vinyles, ainsi qu'un bar proposant des cocktails rafraîchissants. Ces espaces sont parfaits pour des sessions de networking ou pour se détendre."
        },
        {
          title: "Notre Bibliothèque",
          content: "Un espace pour les petits curieux, les professionnels, les amateurs d'histoire et de spiritualité. Une arche de Noé sonore avec CDs et vinyles pour redécouvrir les sons qui ont façonné notre histoire. Un havre de paix loin de l'agitation."
        }
      ]
    },
    services: {
      title: "Nos Activités",
      desc: "Un écosystème complet dédié à l'art, de la création à la scène. Cliquez sur une activité pour en savoir plus.",
      items: {
        live: { 
          id: "live",
          title: "Salles de Concert & Scène Live", 
          desc: "Promotion des artistes à travers des mini-concerts réguliers dans nos magnifiques salles aménagées.",
          cover: dynImages.live_1,
          images: [dynImages.live_2],
          longDesc: "Nos salles de concert sont au cœur du projet d'Africa Sound City. Conçues avec une acoustique de premier plan, elles permettent d'accueillir des mini-concerts enflammés et des spectacles vivants inoubliables. Nous offrons aux artistes locaux et internationaux un espace privilégié pour communier avec leur public.",
          features: ["Acoustique sur-mesure", "Éclairage professionnel (jeux de lumière scéniques)", "Programmation musicale hebdomadaire", "Scène modulable selon le type de formation"]
        },
        studio: { 
          id: "studio",
          title: "Studio & Sonorisation", 
          desc: "Studio d'enregistrement professionnel équipé et services complets de sonorisation pour vos projets.",
          cover: dynImages.studio_1,
          images: [dynImages.studio_2],
          longDesc: "Notre studio d'enregistrement professionnel met à votre disposition les équipements de pointe nécessaires à la réalisation de vos projets musicaux (Albums, EPs, Voix-off). Nos ingénieurs du son chevronnés sont là pour capter l'essence même de votre talent avec des prestations de mixage et mastering de classe mondiale.",
          features: ["Cabine de prise de son isolée", "Traitement acoustique de haute fidélité", "Services de Mixage & Mastering", "Location de matériel de sonorisation externe"]
        },
        masterclass: { 
          id: "masterclass",
          title: "Masterclasses & Apprentissage", 
          desc: "Apprentissage approfondi des instruments acoustiques et traditionnels par des professionnels.",
          cover: dynImages.masterclass_1,
          images: [dynImages.masterclass_2],
          longDesc: "La transmission du savoir est primordiale pour l'association Jah Baba. Nous organisons régulièrement des Masterclasses animées par des musiciens maîtres dans leur art, qu'il s'agisse d'instruments traditionnels africains ou d'acoustique moderne. Ces sessions sont un tremplin vers le perfectionnement musical.",
          features: ["Instruments traditionnels (Percussions, Kora...)", "Techniques vocales avancées", "Ateliers rythmiques", "Interaction directe avec des musiciens professionnels"]
        },
        lifestyle: { 
          id: "lifestyle",
          title: "Restaurant & Bibliothèque", 
          desc: "Un espace accueillant pour se régaler, lire, et faire des rencontres entre passionnés d'art.",
          cover: dynImages.lifestyle_1,
          images: [dynImages.lifestyle_2],
          longDesc: "Au-delà de la musique, Africa Sound City est un espace de vie complet. Profitez d'un restaurant qui revisite la gastronomie africaine dans un cadre chaleureux. Une mini-bibliothèque est à disposition pour enrichir l'esprit et offrir un cadre tranquille de lecture ou d'échanges culturels.",
          features: ["Gastronomie locale exquise", "Bar à rafraîchissements", "Ouvrages littéraires et culturels", "Cadre convivial propice au networking"]
        }
      }
    },
    gallery: {
      title: "La Galerie",
      desc: "Découvrez l'âme de notre centre visuellement : une alliance entre la tradition artistique et l'effervescence contemporaine.",
      items: [
        { id: 1, src: dynImages.live_1, title: "Scène Vibrante", desc: "La communion sacrée entre l'artiste et son public, redéfinissant l'espace scénique africain contemporain.", span: "md:col-span-2 md:row-span-2" },
        { id: 2, src: dynImages.lifestyle_1, title: "Espace de Réflexion", desc: "Un sanctuaire de l'esprit, où la littérature croise les débats culturels contemporains.", span: "md:col-span-1 md:row-span-2" },
        { id: 3, src: dynImages.masterclass_1, title: "Héritage Sonore", desc: "La préservation des instruments traditionnels comme fondation de la modernité musicale.", span: "md:col-span-1 md:row-span-1" },
        { id: 4, src: dynImages.studio_1, title: "Innovation Studio", desc: "L'ingénierie du son de pointe au service des sonorités organiques d'Afrique.", span: "md:col-span-1 md:row-span-1" },
        { id: 5, src: dynImages.lifestyle_2, title: "Art Culinaire", desc: "La gastronomie comme extension directe de notre hospitality et de nos valeurs.", span: "md:col-span-2 md:row-span-1" },
        { id: 6, src: dynImages.live_2, title: "Transes Sonores", desc: "L'énergie pure des tambours béninois capturée en plein vol.", span: "md:col-span-2 md:row-span-1" },
      ]
    },
    reviews: {
      title: "Vos avis comptent !",
      desc: "Découvrez les témoignages de ceux qui font vibrer Africa Sound City au quotidien.",
      rating: "4,5 sur 5 (123 avis)",
      leaveReview: "Laisser un avis",
      formProps: {
        title: "Partagez votre expérience",
        name: "Votre nom",
        email: "Votre adresse e-mail",
        review: "Votre avis",
        submit: "Publier l'avis",
        cancel: "Annuler"
      },
      items: [
        { 
          text: "C’est un beau cadre pour vous exprimer musicalement 🎶, faire des présentations et célébrer votre art et votre talent 🎙️📽️📸 🎷 🎺🎸🥁🪘. Cet espace dispose également d’un bar et d’un restaurant pour vous régaler avec plaisir 😊", 
          author: "Artiste & Visiteur",
          rating: 5
        },
        { 
          text: "Espace recommandé pour les concerts privés et publics, les rencontres en famille, entre amis, les expositions, les activités culturelles et artistiques. Magnifique décor de part et d'autre ! Bravo à l'équipe !!! 👏🏼", 
          author: "Passionné de Culture",
          rating: 5
        },
        { 
          text: "Un centre de spectacle de musique live avec des musiciens très compétents et aguerris. Un centre que j'adore aussi à cause de son restaurant et bar avec un personnel très accueillant et gentil.", 
          author: "Mélomane Averti",
          rating: 4
        }
      ]
    },
    footer: {
      desc: "Le carrefour des cultures, d'art et d'excellence musicale africaine.",
      hoursTitle: "Horaires",
      hoursText: "Ouvert tous les jours • Ferme à 22:00",
      locationTitle: "Adresse & Contact",
      locationText: "Rue 2935, Cotonou",
      locationCity: "Bénin",
      phone: "+229 66 99 63 23",
      email: "africasoundcity@gmail.com",
      socials: {
        facebook: "https://www.facebook.com/AfricaSoundCitycotonou",
        instagram: "https://www.instagram.com/africasoundcity_officiel/",
        tiktok: "https://www.tiktok.com/@africa.sound.city?is_from_webapp=1&sender_device=pc"
      },
      rights: "Tous droits réservés.",
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation"
    }
  },
  en: {
    nav: { home: "Home", about: "About Us", services: "Activities", gallery: "Gallery", reviews: "Reviews" },
    hero: {
      badge: "African Cultural Center",
      title: "Vibrate to the rhythm of African Excellence.",
      desc: "Discover Africa Sound City, the cultural crossroads that values the richness of African music. Concert halls, recording studio, masterclasses, and a welcoming lifestyle space.",
      cta: "Explore our activities"
    },
    about: {
      title: "About Us",
      subtitle: "A deep commitment to Beninese culture",
      desc: "Africa Sound City is more than a center; it's a musical incubator by the Jah Baba Association, dedicated to preserving and promoting the cultural and musical heritage of Benin.",
      sections: [
        {
          title: "Professional Exchange",
          content: "We offer modern meeting rooms for seminars, workshops, and conferences. Recently home to the Young Artist Managers Association training, our space stimulates new ideas."
        },
        {
          title: "Cultural Promotion",
          content: "With two stages for live events and a karaoke stage for all talents, Africa Sound City is the perfect launchpad for artists to connect with their audience."
        },
        {
          title: "Community & Networking",
          content: "A library rich with books, CDs, and vinyls, plus a bar with refreshing cocktails. These spaces are ideal for networking or simply relaxing."
        },
        {
          title: "Our Library",
          content: "A sanctuary for curious minds, professionals, and history buffs. It's a sonic ark where you can rediscover the sounds that shaped our history, away from the hustle."
        }
      ]
    },
    services: {
      title: "Our Activities",
      desc: "A complete ecosystem dedicated to art, from creation to stage. Click on an activity to learn more.",
      items: {
        live: {
          id: "live",
          title: "Concert Halls & Live Scene", 
          desc: "Promoting artists through regular mini-concerts in our beautifully decorated halls.",
          cover: dynImages.live_1,
          images: [dynImages.live_2],
          longDesc: "Our concert halls are at the core of the Africa Sound City project. Designed with premium acoustics, they host fiery mini-concerts and unforgettable live performances. We offer local and international artists a dedicated space to connect with their audience.",
          features: ["Custom acoustic treatment", "Professional stage lighting", "Weekly musical programming", "Modular stage setups"]
        },
        studio: { 
          id: "studio",
          title: "Studio & Audio Engineering", 
          desc: "Professional recording studio and complete sound engineering services for your projects.",
          cover: dynImages.studio_1,
          images: [dynImages.studio_2],
          longDesc: "Our professional recording studio provides the cutting-edge equipment needed for your musical projects (Albums, EPs, Voiceovers). Our seasoned sound engineers are here to capture the essence of your talent with world-class mixing and mastering services.",
          features: ["Isolated sound booth", "High-fidelity acoustic treatment", "Mixing & Mastering services", "External sound system rentals"]
        },
        masterclass: { 
          id: "masterclass",
          title: "Masterclasses & Learning", 
          desc: "In-depth learning of acoustic and traditional instruments taught by professionals.",
          cover: dynImages.masterclass_1,
          images: [dynImages.masterclass_2],
          longDesc: "Knowledge transmission is paramount for the Jah Baba Association. We regularly organize Masterclasses led by master musicians, whether for traditional African instruments or modern acoustics. These sessions are a stepping stone towards musical perfection.",
          features: ["Traditional instruments (Percussions, Kora...)", "Advanced vocal techniques", "Rhythm workshops", "Direct interaction with pro musicians"]
        },
        lifestyle: { 
          id: "lifestyle",
          title: "Restaurant & Library", 
          desc: "A welcoming space to enjoy good food, read, and meet fellow art enthusiasts.",
          cover: dynImages.lifestyle_1,
          images: [dynImages.lifestyle_2],
          longDesc: "Beyond music, Africa Sound City is a complete lifestyle space. Enjoy a restaurant that reimagines African gastronomy in a warm setting. A mini-library is available to enrich the mind and offer a quiet environment for reading or cultural exchanges.",
          features: ["Exquisite local gastronomy", "Refreshment bar", "Literary and cultural books", "Friendly environment for networking"]
        }
      }
    },
    gallery: {
      title: "The Gallery",
      desc: "Discover the soul of our center visually: an alliance between artistic tradition and contemporary vibrancy.",
      items: [
        { id: 1, src: dynImages.live_1, title: "Vibrant Stage", desc: "The sacred communion between artist and audience, redefining the contemporary African stage.", span: "md:col-span-2 md:row-span-2" },
        { id: 2, src: dynImages.lifestyle_1, title: "Space for Reflection", desc: "A sanctuary of the mind, where literature intersects with contemporary cultural debates.", span: "md:col-span-1 md:row-span-2" },
        { id: 3, src: dynImages.masterclass_1, title: "Sonic Heritage", desc: "Preserving traditional instruments as the foundation of musical modernity.", span: "md:col-span-1 md:row-span-1" },
        { id: 4, src: dynImages.studio_1, title: "Studio Innovation", desc: "Cutting-edge sound engineering serving the organic sounds of Africa.", span: "md:col-span-1 md:row-span-1" },
        { id: 5, src: dynImages.lifestyle_2, title: "Culinary Art", desc: "Gastronomy as a direct extension of our hospitality and values.", span: "md:col-span-2 md:row-span-1" },
        { id: 6, src: dynImages.live_2, title: "Sonic Trances", desc: "The pure energy of Beninese drums captured mid-flight.", span: "md:col-span-2 md:row-span-1" },
      ]
    },
    reviews: {
      title: "Your voice counts!",
      desc: "Discover the testimonials of those who make Africa Sound City vibrate every day.",
      rating: "4.5 out of 5 (123 reviews)",
      leaveReview: "Leave a review",
      formProps: {
        title: "Share your experience",
        name: "Your name",
        email: "Your email address",
        review: "Your review",
        submit: "Publish review",
        cancel: "Cancel"
      },
      items: [
         { 
          text: "It is a beautiful setting to express yourself musically 🎶, make presentations and celebrate your art and your talent 🎙️📽️📸 🎷 🎺🎸🥁🪘. This space also has a bar and a restaurant to delight you with pleasure 😊", 
          author: "Artist & Visitor",
          rating: 5
        },
        { 
          text: "Recommended space for private and public concerts, family gatherings, with friends, exhibitions, cultural and artistic activities. Magnificent decor on both sides! Bravo to the team !!! 👏🏼", 
          author: "Culture Enthusiast",
          rating: 5
        },
        { 
          text: "A live music performance center with highly competent and seasoned musicians. A center I also adore because of its restaurant and bar with a very welcoming and kind staff.", 
          author: "Music Lover",
          rating: 4
        }
      ]
    },
    footer: {
      desc: "The crossroads of cultures, art, and African musical excellence.",
      hoursTitle: "Opening Hours",
      hoursText: "Open every day • Closes at 10:00 PM",
      locationTitle: "Location & Contact",
      locationText: "Rue 2935, Cotonou",
      locationCity: "Benin",
      phone: "+229 66 99 63 23",
      email: "africasoundcity@gmail.com",
      socials: {
        facebook: "https://www.facebook.com/AfricaSoundCitycotonou",
        instagram: "https://www.instagram.com/africasoundcity_officiel/",
        tiktok: "https://www.tiktok.com/@africa.sound.city?is_from_webapp=1&sender_device=pc"
      },
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    }
  }
});
