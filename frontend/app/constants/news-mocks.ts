/** Storybook / local demos only — public `/news` routes use the live API. */
export interface NewsArticle {
  slug: string;
  title: string;
  dateLabel: string;
  excerpt: string;
  body: string[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: 'hiitio-expand',
    title: 'Расширение ассортимента HIITIO',
    dateLabel: '15 июля 2026',
    excerpt:
      'В каталоге появились новые линейки контакторов и реле для промышленных применений.',
    body: [
      'Компания СКМ-Энергосервис расширила линейку HIITIO: в каталог добавлены контакторы серии C и реле для промышленных щитов.',
      'Для всех позиций доступны актуальные datasheet и консультация по подбору аналогов под ваш объект.',
    ],
  },
  {
    slug: 'mersen-pdf',
    title: 'Обновлён PDF-каталог MERSEN',
    dateLabel: '2 июля 2026',
    excerpt:
      'Актуальные datasheet и спецификации доступны для скачивания в карточках товаров.',
    body: [
      'Обновлены PDF-каталоги MERSEN по предохранителям и коммутационным аппаратам.',
      'Документы прикрепляются к карточкам товаров в каталоге — запросите поставку через форму на сайте.',
    ],
  },
  {
    slug: 'august-hours',
    title: 'График работы в августе',
    dateLabel: '28 июня 2026',
    excerpt:
      'Офис и склад работают по летнему расписанию. Заявки принимаем онлайн.',
    body: [
      'В августе офис СКМ-Энергосервис работает по сокращённому летнему графику.',
      'Заявки на подбор и поставку принимаются через форму обратной связи и по телефону в рабочие часы.',
    ],
  },
];

export function getNewsArticle(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((item) => item.slug === slug);
}
