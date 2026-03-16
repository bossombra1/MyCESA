import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        Login_User: login,
        Password_User: password,
      });

      const { token, user } = response.data;

      if (user.Id_ROLE !== 1) {
        toast.error('Accès réservé aux administrateurs');
        setLoading(false);
        return;
      }

      authLogin(user, token);
      toast.success('Connexion réussie!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #f5f7f5 0%, #e8f5e9 50%, #fff3e0 100%)',
    }}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #2E7D32 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>

      {/* Éléments décoratives - Vert et Orange */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Formes géométriques décoratives */}
      <div className="absolute top-20 left-10 w-24 h-24 border-3 border-green-600 rounded-lg opacity-25 transform -rotate-45 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 border-2 border-orange-500 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-600 rounded-full opacity-15 animate-blob"></div>

      {/* Contenu principal */}
      <div className="relative w-full max-w-md">
        {/* Carte de connexion */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header épuré avec accent orange */}
          <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white p-10 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300 rounded-full -translate-x-12 translate-y-12 opacity-15"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-3xl">🎓</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">MyCESA</h1>
              <p className="text-green-100 mt-2 text-sm font-medium">Portail Administrateur</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-9 space-y-6">
            {/* Champ Identifiant */}
            <div className="space-y-2">
              <label className="block text-sm font-600 text-gray-800">
                👤 Identifiant
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-200 group-hover:border-slate-300 placeholder-slate-400 bg-slate-50"
                  placeholder="Votre identifiant"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label className="block text-sm font-600 text-gray-800">
                🔐 Mot de passe
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all duration-200 group-hover:border-slate-300 placeholder-slate-400 bg-slate-50 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors text-lg"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </>
              )}
            </button>
          </form>

          {/* Accent orange en bas */}
          <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400"></div>

          {/* Footer */}
          <div className="px-9 py-6 bg-gradient-to-b from-slate-50 to-slate-100">
            <p className="text-center text-xs text-slate-600">
              <span className="block font-semibold text-green-700 mb-1">Accès réservé</span>
              Administrateurs | MyCESA Admin
            </p>
          </div>
        </div>

        {/* Slogan */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm font-medium italic">« Une excellence à votre service ! »</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
