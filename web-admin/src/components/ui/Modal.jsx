import React from 'react';

export default function Modal({ isOpen, title, children, onClose, onSubmit, submitText = 'Enregistrer' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden"
        style={{ background: 'white' }}>

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center"
          style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              ✏️
            </div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(216,67,21,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 max-h-96 overflow-y-auto"
          style={{ background: '#FAFAFA' }}>
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3"
          style={{ background: 'white', borderTop: '1px solid #E5E7EB' }}>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#F3F4F6', color: '#374151' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}>
            ← Retour
          </button>
          {onSubmit && (
            <button onClick={onSubmit}
              className="px-5 py-2 rounded-xl font-bold text-sm text-white transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6D00, #D84315)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #2E7D32, #388E3C)'}>
              💾 {submitText}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}