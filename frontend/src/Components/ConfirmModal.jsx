import React from 'react';

export default function ConfirmModal({ isOpen, title = 'Confirm', message = '', onCancel, onConfirm, confirmLabel = 'Hapus', children }){
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {children ? (
          <div className="mb-4">{children}</div>
        ) : (
          <p className="text-sm text-gray-700 mb-4">{message}</p>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 bg-gray-200 rounded">Batal</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
