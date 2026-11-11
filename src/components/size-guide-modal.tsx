'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<'bracelet' | 'ring' | 'necklace'>('bracelet');
  const [wrist, setWrist] = useState(15);
  const { t } = useLanguage();
  const recommended = wrist + (type === 'bracelet' ? 2 : 0);
  if (!open) return null;
  const tabs = [['bracelet', t('bracelet')], ['ring', t('ring')], ['necklace', t('necklace')]] as const;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto bg-white p-6 md:p-10"><div className="flex justify-between"><h2 className="display text-3xl">{t('tableSizes')}</h2><button onClick={onClose} aria-label={t('closeDialog')}><X /></button></div><div className="mt-7 flex border-b border-line text-xs uppercase tracking-[.1em]">{tabs.map(([key, label]) => <button key={key} onClick={() => setType(key)} className={`border-b-2 px-3 py-3 ${type === key ? 'border-ink' : 'border-transparent text-black/45'}`}>{label}</button>)}</div>{type === 'bracelet' ? <div className="mt-8"><p className="text-sm leading-6 text-black/65">{t('bracelet')}: добавьте 2 см к обхвату запястья для шармов.</p><label className="mt-7 block text-sm">{t('size')}: <strong>{wrist} см</strong><input aria-label={t('size')} type="range" min="12" max="22" step=".5" value={wrist} onChange={(e) => setWrist(Number(e.target.value))} className="mt-4 w-full accent-ink" /></label><div className="mt-6 bg-champagne p-5"><p className="text-xs uppercase tracking-[.12em] text-black/50">{t('recommended')}</p><p className="display mt-1 text-4xl">{recommended} см</p></div></div> : <table className="mt-7 w-full text-left text-sm"><thead><tr className="border-b border-line text-xs uppercase tracking-[.1em] text-black/50"><th className="py-3">{t('size')}</th><th>{type === 'ring' ? 'Диаметр / Диаметр' : 'Длина / Ұзындығы'}</th><th>Подходит / Сәйкес</th></tr></thead><tbody>{(type === 'ring' ? [['16', '17.8 мм', 'S'], ['17', '18.2 мм', 'M'], ['18', '18.8 мм', 'L'], ['19', '19.1 мм', 'XL']] : [['40 см', '40 см', 'Ключица'], ['45 см', '45 см', 'Декольте'], ['50 см', '50 см', 'Ниже ключицы']]).map((row) => <tr key={row[0]} className="border-b border-line"><td className="py-4">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody></table>}</div></div>;
}
