import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RequestWithService, Service } from '../lib/types';
import type { Session } from '@supabase/supabase-js';
import {
  Lock,
  LogOut,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Car,
  Sparkles,
  Shield,
  Armchair,
  ShieldCheck,
  Paintbrush,
  Star,
  Award,
  Wrench,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Новая', color: 'status-new', icon: <Clock size={14} /> },
  in_progress: { label: 'В работе', color: 'status-progress', icon: <Loader2 size={14} /> },
  done: { label: 'Выполнена', color: 'status-done', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Отменена', color: 'status-cancelled', icon: <XCircle size={14} /> },
};

const ICON_OPTIONS = [
  { value: 'sparkles', label: 'Блеск', icon: <Sparkles size={16} /> },
  { value: 'shield', label: 'Щит', icon: <Shield size={16} /> },
  { value: 'armchair', label: 'Салон', icon: <Armchair size={16} /> },
  { value: 'shield-check', label: 'Защита', icon: <ShieldCheck size={16} /> },
  { value: 'eye-off', label: 'Тонировка', icon: <EyeOff size={16} /> },
  { value: 'paintbrush', label: 'Ремонт', icon: <Paintbrush size={16} /> },
  { value: 'car', label: 'Авто', icon: <Car size={16} /> },
  { value: 'star', label: 'Звезда', icon: <Star size={16} /> },
  { value: 'award', label: 'Награда', icon: <Award size={16} /> },
  { value: 'wrench', label: 'Инструмент', icon: <Wrench size={16} /> },
  { value: 'users', label: 'Команда', icon: <Users size={16} /> },
];

type Tab = 'requests' | 'services';

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('requests');

  const [requests, setRequests] = useState<RequestWithService[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcIcon, setSvcIcon] = useState('car');
  const [svcOrder, setSvcOrder] = useState(0);
  const [svcSaving, setSvcSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchRequests();
      fetchServices();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Неверный email или пароль');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRequests([]);
    setServices([]);
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    const { data } = await supabase
      .from('requests')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false });
    setRequests((data as RequestWithService[]) ?? []);
    setLoadingRequests(false);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    setServices(data ?? []);
    setLoadingServices(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('requests').update({ status }).eq('id', id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as RequestWithService['status'] } : r))
    );
  };

  const deleteRequest = async (id: string) => {
    await supabase.from('requests').delete().eq('id', id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleServiceActive = async (svc: Service) => {
    const updated = { ...svc, is_active: !svc.is_active };
    await supabase.from('services').update({ is_active: updated.is_active }).eq('id', svc.id);
    setServices((prev) => prev.map((s) => (s.id === svc.id ? updated : s)));
  };

  const moveService = async (svc: Service, direction: 'up' | 'down') => {
    const sorted = [...services].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((s) => s.id === svc.id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= sorted.length - 1) return;
    const swapWith = sorted[direction === 'up' ? idx - 1 : idx + 1];
    await Promise.all([
      supabase.from('services').update({ display_order: swapWith.display_order }).eq('id', svc.id),
      supabase.from('services').update({ display_order: svc.display_order }).eq('id', swapWith.id),
    ]);
    fetchServices();
  };

  const openServiceForm = (svc?: Service) => {
    if (svc) {
      setEditingService(svc);
      setSvcName(svc.name);
      setSvcDesc(svc.description ?? '');
      setSvcIcon(svc.icon);
      setSvcOrder(svc.display_order);
    } else {
      setEditingService(null);
      setSvcName('');
      setSvcDesc('');
      setSvcIcon('car');
      setSvcOrder(services.length + 1);
    }
    setShowServiceForm(true);
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSvcSaving(true);
    if (editingService) {
      await supabase
        .from('services')
        .update({ name: svcName.trim(), description: svcDesc.trim() || null, icon: svcIcon, display_order: svcOrder })
        .eq('id', editingService.id);
    } else {
      await supabase.from('services').insert({
        name: svcName.trim(),
        description: svcDesc.trim() || null,
        icon: svcIcon,
        display_order: svcOrder,
        is_active: true,
      });
    }
    setShowServiceForm(false);
    setSvcSaving(false);
    fetchServices();
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  if (authLoading) {
    return (
      <div className="page-bg admin-bg">
        <div className="admin-login-card">
          <Loader2 size={32} className="spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-bg admin-bg">
        <div className="admin-login-card">
          <Lock size={32} className="admin-lock-icon" />
          <h1>Админ-панель</h1>
          <p className="admin-subtitle">Введите данные для доступа</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              type="password"
              className={`form-input ${authError ? 'input-error' : ''}`}
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError('');
              }}
              required
            />
            {authError && <p className="error-text">{authError}</p>}
            <button type="submit" className="cta-btn">
              Войти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg admin-bg">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>STM Detail — Админ</h1>
          </div>
          <div className="admin-header-actions">
            <button className="icon-btn" onClick={() => { fetchRequests(); fetchServices(); }} title="Обновить">
              <RefreshCw size={18} />
            </button>
            <button className="icon-btn logout" onClick={handleLogout} title="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Заявки ({requests.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Услуги ({services.length})
          </button>
        </div>

        {/* ===== REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <>
            {loadingRequests ? (
              <div className="loading-state">
                <Loader2 size={32} className="spin" />
                <p>Загрузка заявок...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} />
                <h3>Заявок пока нет</h3>
                <p>Когда клиенты оставят заявки, они появятся здесь</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((req) => {
                  const st = STATUS_MAP[req.status];
                  return (
                    <div key={req.id} className="request-card">
                      <div className="request-card-header">
                        <span className={`status-badge ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        <span className="request-date">
                          {new Date(req.created_at).toLocaleString('ru-BY', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="request-card-body">
                        <div className="request-field">
                          <span className="field-label">Имя</span>
                          <span className="field-value">{req.client_name}</span>
                        </div>
                        <div className="request-field">
                          <span className="field-label">Телефон</span>
                          <a href={`tel:${req.client_phone}`} className="field-value phone-link">
                            {req.client_phone}
                          </a>
                        </div>
                        <div className="request-field">
                          <span className="field-label">Услуга</span>
                          <span className="field-value">{req.service?.name ?? '—'}</span>
                        </div>
                      </div>
                      <div className="request-card-actions">
                        <select
                          className="status-select"
                          value={req.status}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                        >
                          <option value="new">Новая</option>
                          <option value="in_progress">В работе</option>
                          <option value="done">Выполнена</option>
                          <option value="cancelled">Отменена</option>
                        </select>
                        <button className="delete-btn" onClick={() => deleteRequest(req.id)}>
                          Удалить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== SERVICES TAB ===== */}
        {activeTab === 'services' && (
          <>
            <button className="add-service-btn" onClick={() => openServiceForm()}>
              <Plus size={18} /> Добавить услугу
            </button>

            {loadingServices ? (
              <div className="loading-state">
                <Loader2 size={32} className="spin" />
              </div>
            ) : (
              <div className="services-admin-list">
                {services.map((svc) => (
                  <div key={svc.id} className={`service-admin-card ${!svc.is_active ? 'inactive' : ''}`}>
                    <div className="service-admin-body">
                      <div className="service-admin-info">
                        <span className="service-admin-name">
                          {svc.name}
                          {!svc.is_active && <span className="inactive-badge">Скрыта</span>}
                        </span>
                        {svc.description && (
                          <span className="service-admin-desc">{svc.description}</span>
                        )}
                        <span className="service-admin-meta">
                          Иконка: {svc.icon} &middot; Порядок: {svc.display_order}
                        </span>
                      </div>
                      <div className="service-admin-actions">
                        <button
                          className="svc-action-btn"
                          onClick={() => moveService(svc, 'up')}
                          title="Вверх"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          className="svc-action-btn"
                          onClick={() => moveService(svc, 'down')}
                          title="Вниз"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          className="svc-action-btn"
                          onClick={() => toggleServiceActive(svc)}
                          title={svc.is_active ? 'Скрыть' : 'Показать'}
                        >
                          {svc.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          className="svc-action-btn edit"
                          onClick={() => openServiceForm(svc)}
                          title="Редактировать"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="svc-action-btn delete"
                          onClick={() => deleteService(svc.id)}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== SERVICE FORM MODAL ===== */}
      {showServiceForm && (
        <div className="modal-overlay" onClick={() => setShowServiceForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowServiceForm(false)} aria-label="Закрыть">
              <XCircle size={20} />
            </button>
            <h2 className="modal-title">
              {editingService ? 'Редактировать услугу' : 'Новая услуга'}
            </h2>
            <form onSubmit={saveService} className="request-form">
              <label className="form-label">
                Название
                <input
                  type="text"
                  className="form-input"
                  placeholder="Полировка кузова"
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Описание
                <input
                  type="text"
                  className="form-input"
                  placeholder="Восстановление блеска и защита ЛКП"
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                />
              </label>
              <label className="form-label">
                Иконка
                <div className="icon-picker">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`icon-pick-btn ${svcIcon === opt.value ? 'selected' : ''}`}
                      onClick={() => setSvcIcon(opt.value)}
                      title={opt.label}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
              </label>
              <label className="form-label">
                Порядок отображения
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={svcOrder}
                  onChange={(e) => setSvcOrder(Number(e.target.value))}
                />
              </label>
              <button type="submit" className="cta-btn" disabled={svcSaving}>
                {svcSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
