'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import './site-builder.css';

const db = createClient();

type Props = { business: any; onPublished?: () => void };

const ACCENTS: { id: string; hex: string; label: string }[] = [
  { id: 'black', hex: '#111111', label: 'Siyah' },
  { id: 'burgundy', hex: '#7c3157', label: 'Bordo' },
  { id: 'pink', hex: '#ed5da8', label: 'Pembe' },
  { id: 'purple', hex: '#7652a6', label: 'Mor' },
  { id: 'sage', hex: '#6f8f78', label: 'Adaçayı' },
  { id: 'blue', hex: '#71849c', label: 'Mavi' },
  { id: 'orange', hex: '#d8753f', label: 'Turuncu' },
  { id: 'gold', hex: '#9b7b3f', label: 'Altın' },
];

// Önizleme kutusunu gerçek ekran genişliğine göre otomatik ölçekler.
// "Masaüstü" önizlemesi seçiliyken gerçek bir telefonda açılırsa, ölçeklemeden
// tam boyutta render edilir ve her şey aşırı küçük/dağınık görünürdü - bu hook onu çözüyor.
const DEVICE_WIDTH: Record<'desktop' | 'tablet' | 'mobile', number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

function useScaledPreview(device: 'desktop' | 'tablet' | 'mobile', deps: unknown[]) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => setScale(Math.min(1, wrap.clientWidth / DEVICE_WIDTH[device]));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => setFrameHeight(frame.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, ...deps]);

  return { wrapRef, frameRef, scale, frameHeight };
}

export default function SiteBuilderV8({ business, onPublished }: Props) {
  const [themes, setThemes] = useState<any[]>([]);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [status, setStatus] = useState('Hazır');
  const [config, setConfig] = useState<any>(() => business.draft_site_config || legacyConfig(business));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    db.from('theme_catalog')
      .select('*')
      .eq('business_type', business.business_type)
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setThemes(data || []));
  }, [business.business_type]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setStatus('Değişiklik yapılıyor…');
    timer.current = setTimeout(async () => {
      setStatus('Taslak kaydediliyor…');
      const { error } = await db.rpc('save_site_draft', { p_business_id: business.id, p_config: config });
      setStatus(error ? 'Kayıt başarısız' : 'Taslak kaydedildi ✓');
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [config, business.id]);

  const selected = useMemo(() => themes.find((t) => t.id === config.themeId), [themes, config.themeId]);

  function patch(path: string, value: any) {
    setConfig((old: any) => setPath(old, path, value));
  }

  function chooseTheme(theme: any) {
    const palette = theme.config?.palette || {};
    setConfig((old: any) => ({
      ...old,
      themeId: theme.id,
      businessType: business.business_type,
      layoutFamily: theme.layout_family,
      themeConfig: theme.config,
      colors: { ...(old.colors || {}), ...palette },
    }));
  }

  function chooseAccent(accent: { id: string; hex: string }) {
    setConfig((old: any) => ({
      ...old,
      accentColor: accent.id,
      colors: { ...(old.colors || {}), primary: accent.hex },
    }));
  }

  function chooseMode(mode: 'light' | 'dark') {
    setConfig((old: any) => ({
      ...old,
      colorMode: mode,
      colors: {
        ...(old.colors || {}),
        background: mode === 'dark' ? '#15120f' : old.themeConfig?.palette?.background || '#f7f7f4',
        text: mode === 'dark' ? '#f6ead2' : old.themeConfig?.palette?.text || '#111111',
      },
    }));
  }

  async function publish() {
    setStatus('Yayınlanıyor…');
    await db.rpc('save_site_draft', { p_business_id: business.id, p_config: config });
    const mapped = {
      selected_theme_id: config.themeId || null,
      primary_color: config.colors?.primary || business.primary_color,
      background_color: config.colors?.background || business.background_color,
      text_color: config.colors?.text || business.text_color,
      font_family:
        config.themeConfig?.heading_font === 'serif'
          ? 'serif'
          : config.themeConfig?.heading_font === 'display'
            ? 'display'
            : 'sans',
      logo_alignment: config.branding?.logoAlignment || 'left',
      hero_layout: config.hero?.layout || 'text_left',
      text_alignment: config.hero?.textAlignment || 'left',
      hero_title: config.hero?.title ?? '',
      hero_highlight: config.hero?.highlight ?? '',
      hero_description: config.hero?.description ?? '',
      booking_button_text: config.hero?.buttonText || 'Randevu Al',
      show_services: config.sections?.showServices !== false,
      show_gallery: config.sections?.showGallery !== false,
      show_about: config.sections?.showAbout !== false,
      show_contact: config.sections?.showContact !== false,
      gallery_layout: config.gallery?.layout || 'grid',
      contact_layout: config.contact?.layout || 'footer',
      updated_at: new Date().toISOString(),
    };
    await db.from('businesses').update(mapped).eq('id', business.id);
    const { error } = await db.rpc('publish_site_draft', { p_business_id: business.id });
    setStatus(error ? 'Yayınlama başarısız' : 'Site yayınlandı ✓');
    onPublished?.();
  }

  async function reset() {
    const { data } = await db.rpc('reset_site_draft', { p_business_id: business.id });
    if (data) setConfig(data);
    setStatus('Son yayınlanan sürüme dönüldü');
  }

  const { wrapRef, frameRef, scale, frameHeight } = useScaledPreview(device, [config]);

  return (
    <div className="v8builder">
      <aside className="v8controls">
        <div className="v8head">
          <div>
            <small>SİTE OLUŞTURUCU</small>
            <h2>Siteni tasarla</h2>
          </div>
          <span>{status}</span>
        </div>

        <details open>
          <summary>1. Tema</summary>
          <div className="v8themes">
            {themes.map((t) => (
              <button
                type="button"
                className={config.themeId === t.id ? 'active' : ''}
                key={t.id}
                onClick={() => chooseTheme(t)}
              >
                <i
                  style={{
                    background: `linear-gradient(135deg,${t.config?.palette?.primary || '#111'} 50%,${t.config?.palette?.background || '#eee'} 50%)`,
                  }}
                />
                <b>{t.name}</b>
                <small>{t.layout_family}</small>
              </button>
            ))}
          </div>
        </details>

        <details open>
          <summary>2. Renk ve mod</summary>
          <label>Vurgu rengi</label>
          <div className="v8accents">
            {ACCENTS.map((a) => (
              <button
                type="button"
                key={a.id}
                title={a.label}
                className={config.accentColor === a.id ? 'active' : ''}
                style={{ background: a.hex }}
                onClick={() => chooseAccent(a)}
              />
            ))}
          </div>
          <label>Görünüm modu</label>
          <div className="v8modes">
            <button type="button" className={config.colorMode !== 'dark' ? 'active' : ''} onClick={() => chooseMode('light')}>
              ☀ Açık
            </button>
            <button type="button" className={config.colorMode === 'dark' ? 'active' : ''} onClick={() => chooseMode('dark')}>
              ● Koyu
            </button>
          </div>
        </details>

        <details open>
          <summary>3. Logo ve yerleşim</summary>
          <label>
            Logo konumu
            <select value={config.branding?.logoAlignment || 'left'} onChange={(e) => patch('branding.logoAlignment', e.target.value)}>
              <option value="left">Sol</option>
              <option value="center">Orta</option>
              <option value="right">Sağ</option>
              <option value="hidden">Gizli</option>
            </select>
          </label>
          <label>
            Ana ekran
            <select value={config.hero?.layout || 'text_left'} onChange={(e) => patch('hero.layout', e.target.value)}>
              <option value="text_left">Yazı solda</option>
              <option value="text_right">Yazı sağda</option>
              <option value="centered">Ortalanmış</option>
              <option value="text_only">Yalnızca yazı</option>
            </select>
          </label>
          <label>
            Metin hizası
            <select value={config.hero?.textAlignment || 'left'} onChange={(e) => patch('hero.textAlignment', e.target.value)}>
              <option value="left">Sol</option>
              <option value="center">Orta</option>
              <option value="right">Sağ</option>
            </select>
          </label>
        </details>

        <details open>
          <summary>4. Ana ekran yazıları</summary>
          <label>
            Ana başlık
            <input value={config.hero?.title || ''} onChange={(e) => patch('hero.title', e.target.value)} />
          </label>
          <label>
            Vurgulu başlık
            <input value={config.hero?.highlight || ''} onChange={(e) => patch('hero.highlight', e.target.value)} />
          </label>
          <label>
            Açıklama
            <textarea rows={3} value={config.hero?.description || ''} onChange={(e) => patch('hero.description', e.target.value)} />
          </label>
          <label>
            Buton yazısı
            <input value={config.hero?.buttonText || ''} onChange={(e) => patch('hero.buttonText', e.target.value)} />
          </label>
        </details>

        <details>
          <summary>5. Bölümler</summary>
          {[
            ['showServices', 'Hizmetler'],
            ['showGallery', 'Galeri'],
            ['showAbout', 'Hakkımızda'],
            ['showContact', 'İletişim'],
          ].map(([key, label]) => (
            <label className="v8check" key={key}>
              <input
                type="checkbox"
                checked={config.sections?.[key] !== false}
                onChange={(e) => patch(`sections.${key}`, e.target.checked)}
              />
              {label}
            </label>
          ))}
          <label>
            Galeri düzeni
            <select value={config.gallery?.layout || 'grid'} onChange={(e) => patch('gallery.layout', e.target.value)}>
              <option value="grid">Izgara</option>
              <option value="masonry">Masonry</option>
              <option value="slider">Kaydırmalı</option>
              <option value="showcase">Vitrin</option>
            </select>
          </label>
          <label>
            İletişim konumu
            <select value={config.contact?.layout || 'footer'} onChange={(e) => patch('contact.layout', e.target.value)}>
              <option value="footer">Site altında</option>
              <option value="section">Ayrı bölüm</option>
              <option value="both">Her ikisi</option>
            </select>
          </label>
        </details>

        <div className="v8actions">
          <button type="button" onClick={reset}>
            Değişiklikleri Geri Al
          </button>
          <button type="button" className="publish" onClick={publish}>
            Değişiklikleri Yayınla
          </button>
        </div>
      </aside>

      <main className="v8previewArea">
        <div className="deviceButtons">
          <button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')}>
            Masaüstü
          </button>
          <button className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')}>
            Tablet
          </button>
          <button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')}>
            Telefon
          </button>
        </div>

        <div className="previewChrome">
          <div className="previewDots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="previewWrap" ref={wrapRef} style={{ height: frameHeight * scale || undefined }}>
          <div
            className={`previewFrame ${device}`}
            ref={frameRef}
            style={{ width: DEVICE_WIDTH[device], transform: `scale(${scale})` }}
          >
            <Preview business={business} config={config} theme={selected} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Preview({ business, config, theme }: { business: any; config: any; theme: any }) {
  const family = config.layoutFamily || theme?.layout_family || 'modern';
  const align = config.hero?.textAlignment || 'left';
  return (
    <div
      className={`v8site layout-${family} align-${align} ${config.colorMode === 'dark' ? 'dark' : ''}`}
      style={
        {
          '--p': config.colors?.primary || business.primary_color,
          '--bg': config.colors?.background || business.background_color,
          '--txt': config.colors?.text || business.text_color,
        } as React.CSSProperties
      }
    >
      <header className={`logo-${config.branding?.logoAlignment || 'left'}`}>
        {config.branding?.logoAlignment !== 'hidden' && (
          <div>
            {business.logo_url ? <img src={business.logo_url} alt="" /> : <i>{business.name?.charAt(0)}</i>}
            <b>{business.name}</b>
          </div>
        )}
        <nav>
          Hizmetler　Çalışanlar　<span>{config.hero?.buttonText || 'Randevu Al'}</span>
        </nav>
      </header>
      <section className={`previewHero hero-${config.hero?.layout || 'text_left'}`}>
        <small>{business.hero_label || 'PROFESYONEL HİZMET'}</small>
        <h1>
          {config.hero?.title || 'Başlığınız'}
          <em>{config.hero?.highlight || ''}</em>
        </h1>
        <p>{config.hero?.description || 'İşletmenizi anlatan kısa açıklama.'}</p>
        <button>{config.hero?.buttonText || 'Randevu Al'}</button>
      </section>
      {config.sections?.showServices !== false && (
        <section className="previewServices">
          <h2>{business.services_title || 'Hizmetler'}</h2>
          <div>
            {[1, 2, 3].map((n) => (
              <article key={n}>
                <small>0{n}</small>
                <b>Örnek Hizmet</b>
                <p>Hizmet açıklaması</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {config.sections?.showGallery !== false && (
        <section className={`previewGallery ${config.gallery?.layout || 'grid'}`}>
          {[1, 2, 3].map((n) => (
            <i key={n} />
          ))}
        </section>
      )}
      {config.sections?.showAbout !== false && (
        <section className="previewAbout">
          <h2>{business.about_title || 'Hakkımızda'}</h2>
          <p>{business.description || 'İşletmenizi anlatan metin burada görünür.'}</p>
        </section>
      )}
      {config.sections?.showContact !== false && config.contact?.layout !== 'footer' && (
        <section className="previewContact">Telefon　Adres　Instagram</section>
      )}
      <footer>
        {business.name}
        <small>{business.footer_note}</small>
      </footer>
    </div>
  );
}

function legacyConfig(b: any) {
  return {
    schemaVersion: 1,
    legacy: true,
    businessType: b.business_type,
    themeId: b.selected_theme_id,
    layoutFamily: 'modern',
    accentColor: 'black',
    colorMode: 'light',
    colors: { primary: b.primary_color, background: b.background_color, text: b.text_color },
    branding: { name: b.name, logoUrl: b.logo_url, logoAlignment: b.logo_alignment || 'left' },
    hero: {
      title: b.hero_title,
      highlight: b.hero_highlight,
      description: b.hero_description,
      layout: b.hero_layout || 'text_left',
      textAlignment: b.text_alignment || 'left',
      buttonText: b.booking_button_text || 'Randevu Al',
    },
    sections: {
      showServices: b.show_services,
      showGallery: b.show_gallery,
      showAbout: b.show_about,
      showContact: b.show_contact,
    },
    gallery: { layout: b.gallery_layout || 'grid' },
    contact: { layout: b.contact_layout || 'footer' },
  };
}

function setPath(obj: any, path: string, value: any) {
  const copy = structuredClone(obj);
  const parts = path.split('.');
  let cur = copy;
  parts.slice(0, -1).forEach((k) => {
    cur[k] ??= {};
    cur = cur[k];
  });
  cur[parts.at(-1)!] = value;
  return copy;
}
