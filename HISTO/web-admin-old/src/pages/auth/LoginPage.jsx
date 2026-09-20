import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const VERT = '#2E7D32';
const VERT2 = '#388E3C';
const ORANGE = '#D84315';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
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
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${VERT} 0%, ${VERT2} 50%, #4CAF50 100%)`,
      }}
    >
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
        <div className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-bounce bottom-10 right-10"></div>
      </div>

      {/* Carte principale */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 border border-gray-200">
        {/* Header */}
        <div
          className="text-center p-10 relative"
          style={{
            background: `linear-gradient(135deg, ${VERT} 0%, ${VERT2} 100%)`,
          }}
        >
          {/* Logo animé */}
          <div className="bg-white w-28 h-28 rounded-full mx-auto mb-5 flex flex-col items-center justify-center shadow-lg border-4 border-orange-600 animate-pulse relative">
            <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl"></div>
            <p className="text-xs font-black tracking-wider" style={{ color: ORANGE }}>
              GROUPE
            </p>
            <p className="text-xl font-black tracking-wider" style={{ color: ORANGE }}>
              COFE-CESA
            </p>
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="h-0.5 w-14 mx-auto" style={{ backgroundColor: VERT2 }}></div>
              <div className="h-0.5 w-10 mx-auto" style={{ backgroundColor: VERT2 }}></div>
              <div className="h-0.5 w-7 mx-auto" style={{ backgroundColor: VERT2 }}></div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 tracking-widest drop-shadow-lg">
            MyCESA
          </h1>
          <p className="text-white/90 italic text-sm">« Une excellence à votre service ! »</p>

          <div className="inline-block mt-4 px-4 py-1.5 bg-white/20 rounded-full border border-white/30 text-white text-xs font-semibold backdrop-blur-sm">
            📍 Abidjan — Administration
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-800 mb-1">Espace Administrateur</h2>
            <p className="text-sm text-gray-500">Connectez-vous pour gérer la plateforme</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifiant */}
            <div>
              <label className="block text-xs font-black text-gray-900 uppercase mb-2">
                Identifiant
              </label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-green-600 focus-within:shadow-md transition-all">
                <span className="px-3 text-lg">👤</span>
                <input
                  type="text"
                  className="w-full py-3 pr-3 bg-transparent outline-none text-gray-700"
                  placeholder="Votre identifiant"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase mb-2">
                Mot de passe
              </label>
              <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-green-600 focus-within:shadow-md transition-all">
                <span className="px-3 text-lg">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full py-3 pr-3 bg-transparent outline-none text-gray-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-lg text-gray-500 hover:text-green-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="text-right mt-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.error('Contactez le support IT : admin@cesa.ci');
                  }}
                  className="text-xs font-semibold text-green-700 hover:text-orange-600 hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 text-white font-black rounded-xl text-lg shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'SE CONNECTER'
              )}
            </button>
          </form>

          {/* Note admin */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
              <span>🛡️</span>
              Accès strictement réservé aux administrateurs du GROUPE COFE-CESA
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-5 bg-gray-50 border-t-4 border-green-600">
          <p className="text-xs font-bold text-gray-600">MyCESA Administration © 2026</p>
          <p className="text-xs text-gray-400 mt-1">GROUPE COFE-CESA — Fondé en 1992</p>
          <p className="text-xs text-gray-500 mt-2">📞 Support: (+225) 05 44 13 61 13</p>
        </div>
      </div>
    </div>
  );
}
