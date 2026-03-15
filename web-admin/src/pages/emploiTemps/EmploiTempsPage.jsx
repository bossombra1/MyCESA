import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function EmploiTempsPage() {
  const [emploiTemps, setEmploiTemps] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchEmploiTemps();
    }
  }, [selectedClasse]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClasse(response.data[0].Id_Classe);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmploiTemps = async () => {
    try {
      const response = await api.get(`/emploiTemps?classe=${selectedClasse}`);
      setEmploiTemps(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getCreneauCours = (jour, heure) => {
    const creneau = emploiTemps.find(
      (c) => c.Jour_ET === jour && c.Heure_Debut_ET === heure
    );
    return creneau;
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Chargement...</div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Emploi du temps</h1>

        <select
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {classes.map((classe) => (
            <option key={classe.Id_Classe} value={classe.Id_Classe}>
              {classe.Nom_Classe}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horaire</th>
              {jours.map((jour) => (
                <th
                  key={jour}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 text-center"
                >
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heures.map((heure) => (
              <tr key={heure} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 w-20">
                  {heure}
                </td>
                {jours.map((jour) => {
                  const creneau = getCreneauCours(jour, heure);
                  return (
                    <td
                      key={`${jour}-${heure}`}
                      className="px-4 py-3 text-sm text-center border-r"
                    >
                      {creneau ? (
                        <div className="bg-blue-100 p-2 rounded">
                          <p className="font-semibold text-blue-900">{creneau.Matière_ET}</p>
                          <p className="text-xs text-blue-700">{creneau.Prof_ET}</p>
                          <p className="text-xs text-blue-700">{creneau.Salle_ET}</p>
                        </div>
                      ) : (
                        <div className="h-16"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          📝 <strong>Note:</strong> Cliquez sur un créneau pour modifier l'emploi du temps (drag & drop à venir)
        </p>
      </div>
    </div>
  );
}
