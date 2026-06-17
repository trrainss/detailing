import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '../lib/types';
import { RequestForm } from '../components/RequestForm';
import {
  Sparkles,
  Shield,
  Armchair,
  ShieldCheck,
  EyeOff,
  Paintbrush,
  Car,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Award,
  Users,
  Wrench,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles size={22} />,
  shield: <Shield size={22} />,
  armchair: <Armchair size={22} />,
  'shield-check': <ShieldCheck size={22} />,
  'eye-off': <EyeOff size={22} />,
  paintbrush: <Paintbrush size={22} />,
  car: <Car size={22} />,
  star: <Star size={22} />,
  award: <Award size={22} />,
  wrench: <Wrench size={22} />,
  users: <Users size={22} />,
};

const GALLERY_IMAGES = [
  {
    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUcKj6xtifc8vTsjZb3nuniYxsmWW1i9hXa7oNK1XArdsahK6SHJBEFIw&s=10',
    caption: 'Полировка кузова',
  },
  {
    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoV8aYzoBQydqBhTTAKWwTI0kwpzcGA_vqdds3MJ1sd3yGJnsRtFouAL0&s=10',
    caption: 'Нанокерамика',
  },
  {
    src: 'https://spb.okleyka.pro/upload/iblock/caf/xpyg42rb0fjcnjstz9q7o0qq7ff83tqp/3.jpg',
    caption: 'Химчистка салона',
  },
  {
    src: 'https://autokaitsekile.ee/assets/wmremove-transformed-Z1qsJkJt.jpeg',
    caption: 'Защитная пленка PPF',
  },
];

const STATS = [
  { value: '2', label: 'Лет опыта' },
  { value: '100+', label: 'Авто обслужено' },
  { value: '100%', label: 'Гарантия качества' },
];

export function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setServices(data ?? []);
        setLoading(false);
      });
  }, []);

  const openForm = (serviceId?: string) => {
    setSelectedService(serviceId ?? services[0]?.id ?? null);
    setShowForm(true);
  };

  return (
    <div className="page-bg">
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <img
          src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Детейлиннг авто"
          className="hero-bg-img"
        />
        <div className="hero-content">
          <div className="hero-badge">
            <Car size={16} /> STM Detail
          </div>
          <h1 className="hero-title">
            Профессиональный<br />детейлиннг в Минске
          </h1>
          <p className="hero-subtitle">
            Вернём вашему авто заводской блеск и защитим на годы вперёд
          </p>
          <div className="hero-actions">
            <button className="cta-btn hero-cta" onClick={() => openForm()}>
              Оставить заявку
            </button>
            <a href="tel:+375291234567" className="hero-call-btn">
              <Phone size={18} /> Позвонить
            </a>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ===== ABOUT ===== */}
        <section className="about-section">
          <div className="about-header">
            <div className="about-logo">
              <Car size={28} />
            </div>
            <div>
              <h2 className="section-title-left">STM Detail</h2>
              <p className="about-subtitle">Профессиональный детейлиннг-центр</p>
            </div>
          </div>

          <div className="info-chips">
            <span className="chip">
              <MapPin size={14} /> Минск
            </span>
            <span className="chip">
              <Clock size={14} /> Пн–Вс 9:00–21:00
            </span>
          </div>

          <p className="about-text">
            STM Detail — это команда профессионалов с многолетним опытом в сфере
            автомобильного детейлиннга. Мы используем только сертифицированные
            материалы и современное оборудование, чтобы ваш автомобиль выглядел
            безупречно.
          </p>

          {/* Stats */}
          <div className="stats-row">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ===== SERVICES ===== */}
        <section className="services-section">
          <h2 className="section-title">Наши услуги</h2>
          {loading ? (
            <div className="skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-btn" />
              ))}
            </div>
          ) : (
            services.map((service) => (
              <button
                key={service.id}
                className="service-btn"
                onClick={() => openForm(service.id)}
              >
                <span className="service-icon">
                  {iconMap[service.icon] ?? <Car size={22} />}
                </span>
                <div className="service-text">
                  <span className="service-name">{service.name}</span>
                  {service.description && (
                    <span className="service-desc">{service.description}</span>
                  )}
                </div>
                <ChevronRight size={18} className="service-arrow" />
              </button>
            ))
          )}
        </section>

        <div className="divider" />

        {/* ===== GALLERY ===== */}
        <section className="gallery-section">
          <h2 className="section-title">Наши работы</h2>
          <div className="gallery-grid">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className="gallery-item">
                <img src={img.src} alt={img.caption} loading="lazy" />
                <div className="gallery-caption">{img.caption}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ===== SOCIAL ===== */}
        <section className="social-section">
          <h2 className="section-title">Мы в соцсетях</h2>
          <div className="social-row">
            <a
              href="https://www.instagram.com/stmdetailminsk?igsh=MWl5MnJsMXY1Z2FxcQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="social-link-btn"
            >
              <span className="social-icon-circle instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </span>
              <span className="social-link-text">Instagram</span>
              <ChevronRight size={16} className="social-link-arrow" />
            </a>
            <a
              href="https://t.me/stmdetailingminsk"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link-btn"
            >
              <span className="social-icon-circle telegram">
                <MessageCircle size={20} />
              </span>
              <span className="social-link-text">Telegram</span>
              <ChevronRight size={16} className="social-link-arrow" />
            </a>
            <a href="tel:+375291234567" className="social-link-btn">
              <span className="social-icon-circle phone">
                <Phone size={20} />
              </span>
              <span className="social-link-text">Позвонить</span>
              <ChevronRight size={16} className="social-link-arrow" />
            </a>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <button className="cta-btn" onClick={() => openForm()}>
          Оставить заявку
        </button>

        <p className="footer-text">STM Detail &copy; {new Date().getFullYear()}</p>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <RequestForm
          services={services}
          initialServiceId={selectedService}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
