import React, { useState } from 'react';
import { MapPin, Bell, Users, Calendar, Star, Church, Heart, Smartphone, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  const Logo = () => (
    <svg viewBox="0 0 400 400" className="w-10 h-10">
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

  return (
    <div className="min-h-screen bg-white text-sm">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-xl text-gray-800">JCMap</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-indigo-600">Fonctionnalités</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Tarifs</a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700">
              Télécharger
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <MapPin key={i} className="absolute text-white" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, opacity: Math.random()*0.5+0.2 }} size={Math.random()*24+16} />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 py-12">
          <div className="inline-flex items-center bg-white/20 rounded-full px-3 py-1 mb-4">
            <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
            <span className="text-xs">L'app #1 pour l'évangélisation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Trouvez les <span className="text-yellow-400">évangélisations</span><br />près de chez vous
          </h1>
          <p className="text-base text-indigo-100 mb-6 max-w-xl mx-auto">
            JCMap connecte les chrétiens aux événements d'évangélisation. 
            Soyez notifié, participez, impactez votre ville pour Christ !
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 flex items-center justify-center gap-2">
              <Smartphone size={20} /> Télécharger l'app
            </button>
            <button className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 border border-white/30">
              Voir la démo
            </button>
          </div>
          <div className="flex justify-center gap-4 text-xs flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Gratuit</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> iOS & Android</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> +5000 utilisateurs</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "5,000+", label: "Utilisateurs" },
            { value: "500+", label: "Événements" },
            { value: "150+", label: "Églises" },
            { value: "50+", label: "Villes" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Fonctionnalités</h2>
            <p className="text-gray-500">Tout pour faciliter l'évangélisation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: MapPin, color: "bg-blue-500", title: "Carte interactive", desc: "Visualisez tous les événements sur une carte" },
              { icon: Bell, color: "bg-purple-500", title: "Notifications", desc: "Alertes pour les événements proches" },
              { icon: Calendar, color: "bg-green-500", title: "Agenda", desc: "Gérez vos participations" },
              { icon: Users, color: "bg-orange-500", title: "Communauté", desc: "Connectez-vous avec d'autres chrétiens" },
              { icon: Church, color: "bg-pink-500", title: "Pour les églises", desc: "Publiez et gérez vos événements" },
              { icon: Heart, color: "bg-red-500", title: "Témoignages", desc: "Partagez les fruits de l'évangélisation" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-lg transition">
                <div className={`${f.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <f.icon className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Téléchargez", desc: "Gratuit sur iOS et Android" },
              { step: "2", title: "Géolocalisation", desc: "Activez pour voir les événements" },
              { step: "3", title: "Participez", desc: "Inscrivez-vous et évangélisez !" }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                {i < 2 && <ArrowRight className="hidden md:block absolute top-6 -right-3 text-indigo-300" size={24} />}
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tarifs simples</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Gratuit", price: "0€", features: ["Voir les événements", "Notifications 5km", "Inscription événements"], highlight: false },
              { name: "Premium", price: "4,99€", period: "/mois", features: ["Notifications 50km", "Badge Évangéliste", "Stats personnelles"], highlight: true },
              { name: "Église", price: "19,99€", period: "/mois", features: ["Événements illimités", "Page vérifiée", "Analytics détaillés"], highlight: false }
            ].map((plan, i) => (
              <div key={i} className={`rounded-xl p-5 ${plan.highlight ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2' : 'bg-white border border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className={plan.highlight ? 'text-indigo-200' : 'text-gray-400'}>{plan.period}</span>}
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={14} className={plan.highlight ? 'text-yellow-400' : 'text-green-500'} />
                      <span className={plan.highlight ? 'text-indigo-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-bold text-sm ${plan.highlight ? 'bg-yellow-400 text-gray-900' : 'bg-indigo-600 text-white'}`}>
                  Choisir
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Prêt à impacter votre ville ?</h2>
          <p className="text-indigo-100 mb-6 text-sm">Rejoignez des milliers de chrétiens qui utilisent JCMap</p>
          {!submitted ? (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Votre email" 
                className="flex-1 px-4 py-3 rounded-full text-gray-800 outline-none" 
              />
              <button 
                onClick={handleSubmit} 
                className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-300"
              >
                M'inscrire
              </button>
            </div>
          ) : (
            <div className="bg-white/20 rounded-xl p-4">
              <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
              <p className="font-bold">Merci ! Vous serez notifié au lancement 🙏</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo />
            <span className="font-bold text-lg text-white">JCMap</span>
          </div>
          <p className="text-center text-xs mb-4">Connecter les chrétiens pour évangéliser ensemble</p>
          <div className="text-center text-xs">
            © 2025 JCMap. Fait avec ❤️ pour la gloire de Dieu.
          </div>
        </div>
      </footer>
    </div>
  );
}