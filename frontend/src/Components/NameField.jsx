import React from 'react';

export default function NameField({ title = 'Nama', value = '' }){
  return (
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
