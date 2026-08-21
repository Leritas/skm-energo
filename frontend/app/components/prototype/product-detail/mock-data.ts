import type { PrototypeProductDetailData } from './types';

/** PROTOTYPE — static fixture for /prototype/product-detail */
export const PROTOTYPE_PRODUCT_DETAIL_DATA: PrototypeProductDetailData = {
  title: 'Предохранитель NH00 160A',
  manufacturer: 'MERSEN',
  sku: 'NH00-160',
  badges: ['pdf', 'new'],
  description: `Низковольтный предохранитель серии NH00 для промышленных распределительных щитов.

Подходит для силовых цепей до 160 A при номинальном напряжении 690 V AC. Поставка под заказ — сроки и MOQ уточняются менеджером. В комплекте доступны datasheet и сертификаты соответствия.`,
  specs: [
    { label: 'Номинальный ток', value: '160 A' },
    { label: 'Напряжение', value: '690 V AC' },
    { label: 'Серия', value: 'NH00' },
    { label: 'Тип', value: 'Плавкая вставка' },
    { label: 'Стандарт', value: 'IEC 60269' },
  ],
  photos: [
    {
      url: 'https://picsum.photos/seed/nh00-main/900/675',
      filename: 'nh00-front.jpg',
    },
    {
      url: 'https://picsum.photos/seed/nh00-side/900/675',
      filename: 'nh00-side.jpg',
    },
    {
      url: 'https://picsum.photos/seed/nh00-pack/900/675',
      filename: 'nh00-packaging.jpg',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      url: '#',
      filename: 'NH00-160_datasheet.pdf',
      sizeBytes: 1_240_000,
    },
    {
      id: 'doc-2',
      url: '#',
      filename: 'NH00_series_catalog.pdf',
      sizeBytes: 3_850_000,
    },
  ],
  breadcrumbs: [
    { label: 'Каталог', to: '/catalog' },
    {
      label: 'Предохранители, держатели и аксессуары',
      to: '/catalog/predohraniteli',
    },
    {
      label: 'Низковольтные предохранители',
      to: '/catalog/nizkovoltnye-predohraniteli',
    },
    { label: 'Предохранитель NH00 160A' },
  ],
  similarProducts: [
    {
      slug: 'nh1-250a',
      title: 'Предохранитель NH1 250A',
      manufacturer: 'MERSEN',
      sku: 'NH1-250',
      badges: [],
      imageUrl: 'https://picsum.photos/seed/nh1/400/400',
    },
    {
      slug: 'fuse-link-6kv',
      title: 'Плавкий предохранитель 6 kV',
      manufacturer: 'CASRAM',
      sku: 'CAS-FL-6',
      badges: ['onRequest'],
      imageUrl: 'https://picsum.photos/seed/fl6/400/400',
    },
    {
      slug: 'fuse-link-10kv',
      title: 'Плавкий предохранитель 10 kV',
      manufacturer: 'CASRAM',
      sku: 'FL-10KV',
      badges: ['pdf'],
      imageUrl: 'https://picsum.photos/seed/fl10/400/400',
    },
  ],
};

export function prototypeGalleryImages(data: PrototypeProductDetailData) {
  return data.photos.map((photo) => ({
    src: photo.url,
    alt: photo.filename,
  }));
}

export function prototypeDocumentSizeLabel(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
