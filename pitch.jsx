import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, Target, TrendingUp, DollarSign, CheckCircle, Smartphone, Globe, Heart, Zap } from 'lucide-react';

export default function PitchDeck() {
  const [slide, setSlide] = useState(0);

  const Logo = () => (
    <svg viewBox="0 0 400 400" className="w-16 h-16">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
        <linearGradient id="pin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#bg)"/>
      <g transform="translate(200, 175)">
        <path d="M0 -85 C-50 -85 -70 -45 -70 -18 C-70 32 0 85 0 85 C0 85 70 32 70 -18 C70 -45 50 -85 0 -85 Z" fill="url(#pin)"/>
        <circle cx="0" cy="-25" r="35" fill="white"/>
        <rect x="-7" y="-52" width="14" height="50" rx="2" fill="#6366F1"/>
        <rect x="-21" y="-42" width="42" height="12" rx="2" fill="#6366F1"/>
      </g>
    </svg>
  );

  const slides = [
    // Slide 0: Cover
    <div key={0} className="h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex flex-col items-center justify-center text-white p-8">
      <Logo />
      <h1 className="text-4xl font-bold mt-6 mb-2">JCMap</h1>
      <p className="text-xl text-indigo-200 mb-8">Connecter les chrétiens pour évangéliser ensemble</p>
      <div className="bg-white/20 rounded-full px-6 py-2">
        <span className="text-sm">📍 L'app de géolocalisation pour l'évangélisation</span>
      </div>
    </div>,

    // Slide 1: Problème
    <div key={1} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-red-500 mb-4">
        <Target size={28} />
        <h2 className="text-2xl font-bold">Le Problème</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {[
            "😕 Les chrétiens ne savent pas où et quand se déroulent les évangélisations près de chez eux",
            "📢 Les églises ont du mal à mobiliser des participants pour leurs événements",
            "🔄 Aucune plateforme centralisée pour coordonner les efforts d'évangélisation",
            "📉 Beaucoup d'événements sous-fréquentés par manque de visibilité"
          ].map((item, i) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Slide 2: Solution
    <div key={2} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-green-500 mb-4">
        <Zap size={28} />
        <h2 className="text-2xl font-bold">Notre Solution</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <p className="text-xl text-gray-700 font-medium">Une application mobile qui connecte les chrétiens aux événements d'évangélisation géolocalisés</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: MapPin, title: "Carte interactive", desc: "Voir tous les événements" },
            { icon: Smartphone, title: "Notifications push", desc: "Alertes personnalisées" },
            { icon: Users, title: "Gestion participants", desc: "Inscriptions simplifiées" },
            { icon: Globe, title: "Multi-églises", desc: "Toutes dénominations" }
          ].map((f, i) => (
            <div key={i} className="bg-green-50 p-4 rounded-xl text-center">
              <f.icon className="mx-auto text-green-600 mb-2" size={32} />
              <h3 className="font-bold text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Slide 3: Marché
    <div key={3} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-blue-500 mb-4">
        <Globe size={28} />
        <h2 className="text-2xl font-bold">Le Marché</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-blue-600 text-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold">2.4 Milliards</p>
            <p className="text-blue-200">Chrétiens dans le monde</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">40M+</p>
              <p className="text-sm text-gray-600">Chrétiens francophones</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">50K+</p>
              <p className="text-sm text-gray-600">Églises en France</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl">
          <p className="text-center font-medium text-yellow-800">🎯 Cible initiale : France + Afrique francophone</p>
        </div>
      </div>
    </div>,

    // Slide 4: Business Model
    <div key={4} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-purple-500 mb-4">
        <DollarSign size={28} />
        <h2 className="text-2xl font-bold">Modèle Économique</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          <div className="flex items-center bg-gray-100 p-4 rounded-xl">
            <div className="w-20 text-center">
              <p className="text-2xl font-bold text-gray-400">0€</p>
            </div>
            <div className="flex-1 ml-4">
              <p className="font-bold">Gratuit</p>
              <p className="text-sm text-gray-500">Fonctionnalités de base pour tous</p>
            </div>
          </div>
          <div className="flex items-center bg-purple-100 p-4 rounded-xl border-2 border-purple-500">
            <div className="w-20 text-center">
              <p className="text-2xl font-bold text-purple-600">4,99€</p>
              <p className="text-xs text-purple-400">/mois</p>
            </div>
            <div className="flex-1 ml-4">
              <p className="font-bold text-purple-800">Premium</p>
              <p className="text-sm text-purple-600">Rayon étendu, stats, badge</p>
            </div>
          </div>
          <div className="flex items-center bg-indigo-100 p-4 rounded-xl">
            <div className="w-20 text-center">
              <p className="text-2xl font-bold text-indigo-600">19,99€</p>
              <p className="text-xs text-indigo-400">/mois</p>
            </div>
            <div className="flex-1 ml-4">
              <p className="font-bold text-indigo-800">Église / Organisation</p>
              <p className="text-sm text-indigo-600">Dashboard complet, analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>,

    // Slide 5: Projections
    <div key={5} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-green-500 mb-4">
        <TrendingUp size={28} />
        <h2 className="text-2xl font-bold">Projections Financières</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {[
            { year: "Année 1", users: "5K", revenue: "12 800€", color: "bg-green-100 border-green-500" },
            { year: "Année 2", users: "25K", revenue: "74 000€", color: "bg-green-200 border-green-600" },
            { year: "Année 3", users: "100K", revenue: "355 000€", color: "bg-green-300 border-green-700" }
          ].map((row, i) => (
            <div key={i} className={`${row.color} border-l-4 p-4 rounded-r-xl flex justify-between items-center`}>
              <span className="font-bold text-gray-800">{row.year}</span>
              <span className="text-gray-600">{row.users} utilisateurs</span>
              <span className="text-xl font-bold text-green-700">{row.revenue}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-yellow-100 p-4 rounded-xl text-center">
          <p className="font-medium text-yellow-800">📈 Rentabilité dès l'année 2</p>
        </div>
      </div>
    </div>,

    // Slide 6: Roadmap
    <div key={6} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-indigo-500 mb-4">
        <Target size={28} />
        <h2 className="text-2xl font-bold">Roadmap</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-indigo-200"></div>
          {[
            { phase: "Q1 2025", title: "MVP", desc: "Lancement beta, 5 villes pilotes", done: true },
            { phase: "Q2 2025", title: "Croissance", desc: "Expansion nationale, 50 églises", done: false },
            { phase: "Q3 2025", title: "Fonctionnalités", desc: "Témoignages, chat, analytics", done: false },
            { phase: "Q4 2025", title: "International", desc: "Afrique francophone", done: false }
          ].map((item, i) => (
            <div key={i} className="flex items-start mb-4 ml-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center -ml-7 mr-4 ${item.done ? 'bg-green-500' : 'bg-indigo-500'}`}>
                {item.done ? <CheckCircle size={14} className="text-white" /> : <span className="text-white text-xs">{i+1}</span>}
              </div>
              <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-indigo-600 font-medium">{item.phase}</span>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Slide 7: Équipe / Ask
    <div key={7} className="h-full bg-white flex flex-col p-8">
      <div className="flex items-center gap-2 text-orange-500 mb-4">
        <Heart size={28} />
        <h2 className="text-2xl font-bold">Ce que nous recherchons</h2>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-2">💰 Financement</h3>
            <p className="text-gray-700">15 000€ pour développer le MVP et lancer sur les stores</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">⛪ Églises partenaires</h3>
            <p className="text-gray-700">10-20 églises pilotes pour tester et promouvoir l'app</p>
          </div>
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2">🤝 Ambassadeurs</h3>
            <p className="text-gray-700">Leaders chrétiens influents pour le bouche-à-oreille</p>
          </div>
        </div>
      </div>
    </div>,

    // Slide 8: Contact
    <div key={8} className="h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex flex-col items-center justify-center text-white p-8">
      <Logo />
      <h1 className="text-3xl font-bold mt-6 mb-2">Rejoignez l'aventure !</h1>
      <p className="text-indigo-200 mb-8 text-center">Ensemble, impactons les villes pour Christ</p>
      <div className="space-y-3 text-center">
        <p className="text-lg">📧 contact@jcmap.app</p>
        <p className="text-lg">🌐 www.jcmap.app</p>
      </div>
      <div className="mt-8 bg-white/20 rounded-full px-6 py-3">
        <span className="font-medium">🙏 Merci pour votre attention !</span>
      </div>
    </div>
  ];

  const nextSlide = () => setSlide(s => Math.min(s + 1, slides.length - 1));
  const prevSlide = () => setSlide(s => Math.max(s - 1, 0));

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Slide content */}
      <div className="aspect-video relative overflow-hidden">
        {slides[slide]}
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={prevSlide} disabled={slide === 0} className={`flex items-center gap-1 px-3 py-1 rounded ${slide === 0 ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`}>
          <ChevronLeft size={20} /> Précédent
        </button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition ${i === slide ? 'bg-indigo-500 w-4' : 'bg-gray-600 hover:bg-gray-500'}`} />
          ))}
        </div>
        
        <button onClick={nextSlide} disabled={slide === slides.length - 1} className={`flex items-center gap-1 px-3 py-1 rounded ${slide === slides.length - 1 ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`}>
          Suivant <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Slide counter */}
      <div className="bg-gray-900 text-center text-gray-500 text-sm py-2">
        Slide {slide + 1} / {slides.length}
      </div>
    </div>
  );
}