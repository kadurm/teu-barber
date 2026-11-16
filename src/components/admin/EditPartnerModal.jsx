import React, { useState, useEffect } from 'react';
import { X, User, Phone, FileText, Key, Percent, CheckCircle2, Camera, Upload } from 'lucide-react';

// Tamanho final da foto de perfil (quadrada). Fica salva no próprio cadastro do barbeiro,
// então precisa ser leve: alvo de até ~45 KB.
const AVATAR_SIZE = 400;
const AVATAR_MAX_CHARS = 60000;

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Formato não suportado neste navegador. Envie uma foto em JPG, PNG ou WebP.'));
  };
  img.src = url;
});

// Recorta no centro em quadrado, reduz e comprime (WebP; JPEG se o navegador não gerar WebP)
export const imageFileToAvatar = async (file) => {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error('Selecione um arquivo de imagem.');
  }
  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  // Retratos: sobe um pouco o recorte para priorizar o rosto
  const sy = img.naturalHeight > img.naturalWidth ? (img.naturalHeight - side) * 0.3 : (img.naturalHeight - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  for (const quality of [0.82, 0.72, 0.6, 0.5]) {
    let data = canvas.toDataURL('image/webp', quality);
    if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', quality);
    if (data.length <= AVATAR_MAX_CHARS) return data;
  }
  throw new Error('Imagem muito detalhada para otimizar. Tente outra foto.');
};

export default function EditPartnerModal({ isOpen, onClose, onSave, barberToEdit }) {
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Barbeiro Parceiro',
    phone: '',
    document: '',
    pixKey: '',
    pixKeyType: 'CPF',
    commissionRate: 50,
    specialty: 'Cortes & Barba',
    bio: '',
    avatar: '',
    active: true,
  });

  useEffect(() => {
    setPhotoError('');
    if (barberToEdit) {
      setFormData({
        name: barberToEdit.name || '',
        role: barberToEdit.role || 'Barbeiro Parceiro',
        phone: barberToEdit.phone || '',
        document: barberToEdit.document || '',
        pixKey: barberToEdit.pixKey || '',
        pixKeyType: barberToEdit.pixKeyType || 'CPF',
        commissionRate: barberToEdit.commissionRate !== undefined ? barberToEdit.commissionRate : 50,
        specialty: barberToEdit.specialty || '',
        bio: barberToEdit.bio || '',
        avatar: barberToEdit.avatar || '',
        active: barberToEdit.active !== false,
      });
    } else {
      setFormData({
        name: '',
        role: 'Barbeiro Parceiro',
        phone: '',
        document: '',
        pixKey: '',
        pixKeyType: 'CPF',
        commissionRate: 50,
        specialty: 'Cortes & Barba',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        active: true,
      });
    }
  }, [barberToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    setPhotoLoading(true);
    try {
      const avatar = await imageFileToAvatar(file);
      setFormData(prev => ({ ...prev, avatar }));
    } catch (err) {
      setPhotoError(err.message || 'Não foi possível usar essa imagem.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (photoLoading) return;
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome do profissional.');
      return;
    }
    onSave({
      ...formData,
      commissionRate: Number(formData.commissionRate) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {barberToEdit ? 'Editar Dados do Parceiro' : 'Novo Parceiro da Equipe'}
              </h3>
              <p className="text-xs text-zinc-400">
                Cadastro profissional, documentos, Pix e comissionamento acordado
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Gustavo Silva"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Cargo / Papel */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Função / Cargo</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Barbeiro Parceiro, Master Barber"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Taxa de Comissão % */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-500" />
                Comissão por Serviço (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="Ex: 50"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">%</span>
              </div>
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(38) 99999-9999"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Documento (CPF / RG) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Documento (CPF / RG)
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Tipo de Chave Pix */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Tipo de Chave Pix</label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="CPF">CPF</option>
                <option value="Telefone">Telefone</option>
                <option value="E-mail">E-mail</option>
                <option value="Aleatória">Chave Aleatória (EVP)</option>
              </select>
            </div>

            {/* Chave Pix */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Chave Pix de Pagamento
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="Insira a chave Pix para repasse"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Especialidade */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300">Especialidade / Foco</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Cortes Degradê, Navalha, Barboterapia e Barba Rústica"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Foto de Perfil (upload) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
                  {formData.avatar
                    ? <img src={formData.avatar} alt="Foto do parceiro" className="w-full h-full object-cover" />
                    : <User className="w-8 h-8 text-zinc-600" />}
                </div>
                <div className="space-y-2 min-w-0">
                  <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-xs font-semibold transition-colors ${photoLoading ? 'text-zinc-500 cursor-wait' : 'text-white hover:bg-white/5 cursor-pointer'}`}>
                    <Upload className="w-4 h-4 text-amber-400" />
                    {photoLoading ? 'Processando...' : (formData.avatar ? 'Trocar foto' : 'Enviar foto')}
                    <input type="file" accept="image/*" className="hidden" disabled={photoLoading} onChange={handlePhotoChange} />
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Recortada em quadrado e otimizada automaticamente. Prefira foto do rosto, de frente.
                  </p>
                  {photoError && <p className="text-[11px] text-red-400">{photoError}</p>}
                </div>
              </div>
            </div>

            {/* Status Ativo */}
            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="partnerActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="partnerActive" className="text-xs text-zinc-300 select-none cursor-pointer">
                Parceiro ativo (disponível para novos agendamentos e repasses)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Parceiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
