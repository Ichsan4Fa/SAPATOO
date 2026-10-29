// Modal panels close on Escape (built into <dialog>), on anything marked data-close, and on a click outside the paper.
export const setUpDialog = (dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-close]')) dialog.close();
  });
  return {
    open: () => { if (!dialog.open) dialog.showModal(); },
    close: () => dialog.close(),
    isOpen: () => dialog.open,
  };
};
