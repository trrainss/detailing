import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '../lib/types';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  services: Service[];
  onClose: () => void;
  initialServiceId?: string | null;
}

export function RequestForm({ services, onClose, initialServiceId }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState(initialServiceId ?? services[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !serviceId) return;

    setSubmitting(true);
    const { error } = await supabase.from('requests').insert({
      client_name: name.trim(),
      client_phone: phone.trim(),
      service_id: serviceId,
    });

    if (error) {
      setResult('error');
    } else {
      setResult('success');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>

        {result === 'success' ? (
          <div className="result-state">
            <CheckCircle size={48} className="result-icon success" />
            <h3>Заявка отправлена!</h3>
            <p>Мы свяжемся с вами в ближайшее время</p>
            <button className="cta-btn" onClick={onClose}>
              Отлично
            </button>
          </div>
        ) : result === 'error' ? (
          <div className="result-state">
            <AlertCircle size={48} className="result-icon error" />
            <h3>Ошибка</h3>
            <p>Не удалось отправить заявку. Попробуйте позже.</p>
            <button className="cta-btn" onClick={() => setResult(null)}>
              Попробовать снова
            </button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">Оставить заявку</h2>
            <form onSubmit={handleSubmit} className="request-form">
              <label className="form-label">
                Ваше имя
                <input
                  type="text"
                  className="form-input"
                  placeholder="Иван"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Телефон
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+375 (29) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Услуга
                <select
                  className="form-select"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className="cta-btn" disabled={submitting}>
                {submitting ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
