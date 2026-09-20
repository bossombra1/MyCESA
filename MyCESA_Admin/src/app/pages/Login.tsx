import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { LockKeyhole, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = state?.from?.pathname || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérification de la session existante
  if (localStorage.getItem('token') && localStorage.getItem('user')) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email.trim(), password);
      const authData = response.data;

      if (!authData?.token || !authData?.user) {
        throw new Error('Réponse API invalide');
      }

      if (authData.user.Id_ROLE !== 1 && authData.user.Lib_Role !== 'Administrateur') {
        throw new Error('Ce compte n’a pas accès à l’administration');
      }

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-50 flex items-center justify-center font-sans">
      <div className="grid w-full max-w-6xl min-h-[600px] grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        
        {/* Section gauche : Branding */}
        <section className="hidden lg:flex flex-col justify-between p-12 bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">MyCESA Admin</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">Pilotez vos données en toute sécurité.</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Gérez les étudiants, notes et emplois du temps via une interface unifiée connectée à votre API backend.
            </p>
          </div>
          <div className="flex gap-4 opacity-80">
            {['JWT Secure', 'MySQL Ready', 'Admin Only'].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-blue-700/50 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Section droite : Formulaire */}
        <section className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Connexion</h2>
              <p className="text-slate-500 mt-2">Bienvenue sur la console d'administration.</p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Identifiant</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 focus-visible:ring-blue-500 transition-all"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 focus-visible:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Se connecter'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}