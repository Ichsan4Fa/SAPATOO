const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export const formatRupiah = (amount) => `Rp ${rupiah.format(amount)}`;
