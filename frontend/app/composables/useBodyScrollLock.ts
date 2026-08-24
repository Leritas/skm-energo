let lockCount = 0;
let savedBodyOverflow = '';

function lockBodyScroll() {
  savedBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  document.body.style.overflow = savedBodyOverflow;
}

export function useBodyScrollLock(locked: Ref<boolean>) {
  watch(
    locked,
    (isLocked) => {
      if (!import.meta.client) {
        return;
      }

      if (isLocked) {
        if (lockCount === 0) {
          lockBodyScroll();
        }
        lockCount++;
        return;
      }

      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        unlockBodyScroll();
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (!import.meta.client || !locked.value) {
      return;
    }

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      unlockBodyScroll();
    }
  });
}
