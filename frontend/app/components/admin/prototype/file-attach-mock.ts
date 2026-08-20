export interface MockAttachedFile {
  id: number;
  url: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

export type PrototypeEntity = 'product' | 'news' | 'category';

let nextId = 100;

function makePhoto(filename: string, seed: number): MockAttachedFile {
  return {
    id: nextId++,
    url: `/logo.jpg?v=${seed}`,
    filename,
    sizeBytes: 240_000 + seed * 1000,
    mimeType: 'image/jpeg',
  };
}

function makeDocument(filename: string): MockAttachedFile {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
  const mime =
    ext === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return {
    id: nextId++,
    url: `#mock-document-${nextId}`,
    filename,
    sizeBytes: 1_200_000,
    mimeType: mime,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useFileAttachPrototype() {
  const entity = ref<PrototypeEntity>('product');
  const lastPersistAction = ref(
    'Начальное состояние загружено из памяти (mock).',
  );

  const photos = ref<MockAttachedFile[]>([
    makePhoto('nh00-front.jpg', 1),
    makePhoto('nh00-side.jpg', 2),
    makePhoto('nh00-label.jpg', 3),
  ]);

  const documents = ref<MockAttachedFile[]>([
    makeDocument('Паспорт NH00-160A.pdf'),
    makeDocument('Сертификат соответствия.pdf'),
  ]);

  const coverPhoto = ref<MockAttachedFile | null>(
    makePhoto('cover-hiitio.jpg', 9),
  );

  function persist(message: string) {
    lastPersistAction.value = `${new Date().toLocaleTimeString('ru-RU')} — ${message}`;
  }

  function uploadPhoto() {
    if (photos.value.length >= 15) {
      persist('Отклонено: лимит 15 Photos.');
      return;
    }
    const item = makePhoto(
      `upload-${photos.value.length + 1}.jpg`,
      photos.value.length + 10,
    );
    photos.value = [...photos.value, item];
    persist(`Photo «${item.filename}» добавлена в конец (mock upload).`);
  }

  function removePhoto(id: number) {
    const name = photos.value.find((p) => p.id === id)?.filename ?? String(id);
    photos.value = photos.value.filter((p) => p.id !== id);
    persist(`Photo «${name}» удалена (mock detach).`);
  }

  function movePhoto(id: number, delta: number) {
    const index = photos.value.findIndex((p) => p.id === id);
    if (index < 0) {
      return;
    }
    const target = index + delta;
    if (target < 0 || target >= photos.value.length) {
      return;
    }
    const next = [...photos.value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    photos.value = next;
    persist(`Photo «${item.filename}» переставлена (mock reorder).`);
  }

  function makePhotoFirst(id: number) {
    const index = photos.value.findIndex((p) => p.id === id);
    if (index <= 0) {
      return;
    }
    const next = [...photos.value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    photos.value = next;
    persist(`Photo «${item.filename}» — теперь на карточке (mock).`);
  }

  function reorderPhotos(ids: number[]) {
    const map = new Map(photos.value.map((p) => [p.id, p]));
    photos.value = ids.map((id) => map.get(id)!).filter(Boolean);
    persist('Порядок Photos сохранён (mock PUT order).');
  }

  function uploadDocument() {
    if (documents.value.length >= 15) {
      persist('Отклонено: лимит 15 Documents.');
      return;
    }
    const item = makeDocument(
      `Новый документ ${documents.value.length + 1}.pdf`,
    );
    documents.value = [...documents.value, item];
    persist(`Document «${item.filename}» добавлен (mock upload).`);
  }

  function removeDocument(id: number) {
    const name =
      documents.value.find((d) => d.id === id)?.filename ?? String(id);
    documents.value = documents.value.filter((d) => d.id !== id);
    persist(`Document «${name}» удалён (mock detach).`);
  }

  function moveDocument(id: number, delta: number) {
    const index = documents.value.findIndex((d) => d.id === id);
    if (index < 0) {
      return;
    }
    const target = index + delta;
    if (target < 0 || target >= documents.value.length) {
      return;
    }
    const next = [...documents.value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    documents.value = next;
    persist(`Document «${item.filename}» переставлен (mock reorder).`);
  }

  function replaceCover() {
    const item = makePhoto(`cover-${Date.now()}.jpg`, 99);
    coverPhoto.value = item;
    persist(`Cover Photo заменена на «${item.filename}» (mock replace).`);
  }

  function removeCover() {
    coverPhoto.value = null;
    persist('Cover Photo удалена (mock detach).');
  }

  const stateSnapshot = computed(() =>
    JSON.stringify(
      {
        entity: entity.value,
        photos: photos.value.map(({ id, filename }) => ({ id, filename })),
        documents: documents.value.map(({ id, filename }) => ({
          id,
          filename,
        })),
        coverPhoto: coverPhoto.value
          ? { id: coverPhoto.value.id, filename: coverPhoto.value.filename }
          : null,
      },
      null,
      2,
    ),
  );

  function setEntity(next: PrototypeEntity) {
    entity.value = next;
  }

  return {
    entity,
    setEntity,
    photos,
    documents,
    coverPhoto,
    lastPersistAction,
    stateSnapshot,
    uploadPhoto,
    removePhoto,
    movePhoto,
    makePhotoFirst,
    reorderPhotos,
    uploadDocument,
    removeDocument,
    moveDocument,
    replaceCover,
    removeCover,
  };
}

export type FileAttachPrototype = ReturnType<typeof useFileAttachPrototype>;
