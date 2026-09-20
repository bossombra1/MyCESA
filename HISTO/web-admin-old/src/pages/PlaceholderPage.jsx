import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">Cette page est en cours de développement...</p>
        <p className="text-gray-500 mt-2">Revenez bientôt!</p>
      </div>
    </div>
  );
}
