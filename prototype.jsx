import React, { useState } from 'react';
import { MapPin, Calendar, Users, Bell, Search, Plus, ChevronRight, Clock, Navigation, Heart, Share2, Filter, User, Home, Map, Settings, ChevronLeft, Check, Star } from 'lucide-react';

const events = [
  { id: 1, title: "Évangélisation Place de la Gare", type: "Rue", date: "Sam 28 Nov", time: "14:00 - 17:00", distance: "0.8 km", org: "Église Vie Nouvelle", participants: 12, lat: 48.85, lng: 2.35, desc: "Distribution de tracts et témoignages personnels" },
  { id: 2, title: "Croisade d'évangélisation", type: "Croisade", date: "Dim 29 Nov", time: "18:00 - 21:00", distance: "2.3 km", org: "Mission Internationale", participants: 45, lat: 48.86, lng: 2.34, desc: "Grande soirée avec louange et prédication" },
  { id: 3, title: "Porte-à-porte Quartier Nord", type: "Porte-à-porte", date: "Mer 2 Déc", time: "10:00 - 12:00", distance: "1.5 km", org: "Assemblée de Dieu", participants: 8, lat: 48.87, lng: 2.36, desc: "Visite des foyers avec littérature chrétienne" },
  { id: 4, title: "Concert Gospel Évangélique", type: "Concert", date: "Ven 4 Déc", time: "19:30 - 22:00", distance: "4.2 km", org: "Chorale Grâce Divine", participants: 120, lat: 48.84, lng: 2.33, desc: "Concert gratuit ouvert à tous" },
];

const typeColors = {
  "Rue": "bg-blue-500",
  "Croisade": "bg-purple-500",
  "Porte-à-porte": "bg-green-500",
  "Concert": "bg-orange-500"
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showFilter, setShowFilter] = useState(false);
  const [registered, setRegistered] = useState([]);
  const [radius, setRadius] = useState(5);

  const NavBar = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-20">
      {[
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'map', icon: Map, label: 'Carte' },
        { id: 'calendar', icon: Calendar, label: 'Agenda' },
        { id: 'profile', icon: User, label: 'Profil' }
      ].map(tab => (
        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setScreen(tab.id); }} className={`flex flex-col items-center p-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`}>
          <tab.icon size={22} />
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const Header = ({ title, back, action }) => (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
      {back ? <button onClick={() => setScreen('home')}><ChevronLeft size={24} /></button> : <div className="w-6" />}
      <h1 className="font-bold text-lg">{title}</h1>
      {action || <div className="w-6" />}
    </div>
  );

  const EventCard = ({ event, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-xl shadow-md p-4 mb-3 border border-gray-100 active:scale-98 transition-transform cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <span className={`${typeColors[event.type]} text-white text-xs px-2 py-1 rounded-full`}>{event.type}</span>
        <span className="text-gray-400 text-sm flex items-center"><MapPin size={14} className="mr-1" />{event.distance}</span>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
      <p className="text-gray-500 text-sm mb-2">{event.org}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-indigo-600 flex items-center"><Calendar size={14} className="mr-1" />{event.date}</span>
        <span className="text-gray-500 flex items-center"><Users size={14} className="mr-1" />{event.participants} inscrits</span>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-indigo-200 text-sm">Bienvenue 👋</p>
            <h1 className="font-bold text-xl">JCMap</h1>
          </div>
          <button className="relative"><Bell size={24} /><span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span></button>
        </div>
        <div className="bg-white/20 rounded-xl p-3 flex items-center">
          <Search size={20} className="mr-2 text-white/70" />
          <input placeholder="Rechercher un événement..." className="bg-transparent flex-1 text-white placeholder-white/70 outline-none text-sm" />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 pb-24">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">Près de vous <span className="text-indigo-600">({radius}km)</span></h2>
          <button onClick={() => setShowFilter(true)} className="text-indigo-600 flex items-center text-sm"><Filter size={16} className="mr-1" />Filtrer</button>
        </div>
        
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 mb-4 text-white">
          <p className="text-sm opacity-90">🔥 Événement à venir</p>
          <h3 className="font-bold text-lg">Croisade ce dimanche !</h3>
          <p className="text-sm opacity-90">Plus que 2 jours • 2.3 km</p>
        </div>

        {events.map(event => (
          <EventCard key={event.id} event={event} onClick={() => { setSelectedEvent(event); setScreen('detail'); }} />
        ))}
      </div>
      <NavBar />

      {showFilter && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-end" onClick={() => setShowFilter(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Filtres</h3>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Rayon de recherche: {radius} km</label>
              <input type="range" min="1" max="20" value={radius} onChange={e => setRadius(e.target.value)} className="w-full" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Type d'événement</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(typeColors).map(type => (
                  <span key={type} className={`${typeColors[type]} text-white px-3 py-1 rounded-full text-sm cursor-pointer`}>{type}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setShowFilter(false)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold">Appliquer</button>
          </div>
        </div>
      )}
    </div>
  );

  const MapScreen = () => (
    <div className="flex flex-col h-full">
      <Header title="Carte des événements" />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 opacity-30">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="absolute bg-gray-300 rounded" style={{ left: `${Math.random()*80+10}%`, top: `${Math.random()*80+10}%`, width: `${Math.random()*100+50}px`, height: '2px', transform: `rotate(${Math.random()*180}deg)` }} />
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping" />
            </div>
            {events.map((e, i) => (
              <button key={e.id} onClick={() => { setSelectedEvent(e); setScreen('detail'); }} className="absolute transform -translate-x-1/2 -translate-y-full" style={{ left: `${20 + i * 20}%`, top: `${30 + i * 15}%` }}>
                <div className={`${typeColors[e.type]} text-white p-2 rounded-full shadow-lg`}><MapPin size={20} /></div>
                <div className="bg-white px-2 py-1 rounded shadow text-xs mt-1 whitespace-nowrap">{e.distance}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-24 left-4 right-4 bg-white rounded-xl shadow-lg p-3">
          <p className="text-sm text-gray-500 mb-1">4 événements dans un rayon de {radius}km</p>
          <p className="font-semibold text-gray-800">Appuyez sur un marqueur pour plus de détails</p>
        </div>
      </div>
      <NavBar />
    </div>
  );

  const DetailScreen = () => {
    const isRegistered = registered.includes(selectedEvent?.id);
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <button onClick={() => setScreen('home')} className="mb-2"><ChevronLeft size={24} /></button>
          <span className={`${typeColors[selectedEvent?.type]} text-white text-xs px-2 py-1 rounded-full`}>{selectedEvent?.type}</span>
          <h1 className="font-bold text-xl mt-2">{selectedEvent?.title}</h1>
          <p className="text-indigo-200">{selectedEvent?.org}</p>
        </div>
        
        <div className="flex-1 overflow-auto p-4 pb-32">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center mb-3 pb-3 border-b">
              <Calendar className="text-indigo-600 mr-3" size={24} />
              <div><p className="font-semibold">{selectedEvent?.date}</p><p className="text-gray-500 text-sm">{selectedEvent?.time}</p></div>
            </div>
            <div className="flex items-center mb-3 pb-3 border-b">
              <MapPin className="text-indigo-600 mr-3" size={24} />
              <div><p className="font-semibold">{selectedEvent?.distance}</p><p className="text-gray-500 text-sm">de votre position</p></div>
            </div>
            <div className="flex items-center">
              <Users className="text-indigo-600 mr-3" size={24} />
              <div><p className="font-semibold">{selectedEvent?.participants} participants</p><p className="text-gray-500 text-sm">inscrits</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="font-bold mb-2">Description</h3>
            <p className="text-gray-600">{selectedEvent?.desc}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="font-bold mb-3">Localisation</h3>
            <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center mb-3">
              <MapPin className="text-gray-400" size={40} />
            </div>
            <button className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg flex items-center justify-center"><Navigation size={18} className="mr-2" />Obtenir l'itinéraire</button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
          <button className="p-3 border rounded-xl"><Share2 size={20} className="text-gray-600" /></button>
          <button className="p-3 border rounded-xl"><Heart size={20} className={isRegistered ? "text-red-500 fill-red-500" : "text-gray-600"} /></button>
          <button onClick={() => setRegistered(prev => isRegistered ? prev.filter(id => id !== selectedEvent.id) : [...prev, selectedEvent.id])} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center ${isRegistered ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
            {isRegistered ? <><Check size={20} className="mr-2" />Inscrit</> : "S'inscrire"}
          </button>
        </div>
      </div>
    );
  };

  const CalendarScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Mon agenda" />
      <div className="flex-1 overflow-auto p-4 pb-24">
        {registered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Calendar size={48} className="mb-4" />
            <p>Aucun événement inscrit</p>
            <p className="text-sm">Inscrivez-vous à des événements</p>
          </div>
        ) : (
          events.filter(e => registered.includes(e.id)).map(event => (
            <EventCard key={event.id} event={event} onClick={() => { setSelectedEvent(event); setScreen('detail'); }} />
          ))
        )}
      </div>
      <NavBar />
    </div>
  );

  const ProfileScreen = () => (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Mon profil" />
      <div className="flex-1 overflow-auto p-4 pb-24">
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
            <User size={32} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Jean Dupont</h3>
            <p className="text-gray-500">Membre depuis 2024</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mb-4">
          <div className="p-4 border-b flex justify-between items-center">
            <span>Événements participés</span>
            <span className="font-bold text-indigo-600">12</span>
          </div>
          <div className="p-4 border-b flex justify-between items-center">
            <span>Événements organisés</span>
            <span className="font-bold text-indigo-600">3</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span>Rayon par défaut</span>
            <span className="font-bold text-indigo-600">{radius} km</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          {['Notifications', 'Mon église', 'Paramètres', 'Aide'].map((item, i) => (
            <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center cursor-pointer">
              <span>{item}</span>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          ))}
        </div>

        <button className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center">
          <Plus size={20} className="mr-2" />Créer un événement
        </button>
      </div>
      <NavBar />
    </div>
  );

  return (
    <div className="w-full max-w-sm mx-auto h-screen bg-white relative overflow-hidden shadow-2xl rounded-3xl border-8 border-gray-800">
      <div className="h-full">
        {screen === 'home' && <HomeScreen />}
        {screen === 'map' && <MapScreen />}
        {screen === 'detail' && <DetailScreen />}
        {screen === 'calendar' && <CalendarScreen />}
        {screen === 'profile' && <ProfileScreen />}
      </div>
    </div>
  );
}