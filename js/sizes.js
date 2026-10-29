// Foot length to shoe size. A shoe's inside is about 1.5 cm longer than the foot; EU sizes are counted in
// Paris points (2/3 cm), UK sizes in barleycorns (1/3 inch) from a fixed start.

export const STOCKED_SIZES = { min: 19, max: 47 }; // the smallest and largest EU sizes on the price list
export const FOOT_LENGTHS = { min: 10, max: 32 }; // the centimetres the slip accepts

export const toHalf = (value) => Math.round(value * 2) / 2;
export const parseLength = (text) => parseFloat(String(text).trim().replace(',', '.'));
export const clampFoot = (cm) => Math.min(FOOT_LENGTHS.max, Math.max(FOOT_LENGTHS.min, cm));
export const isStocked = (eu) => eu >= STOCKED_SIZES.min && eu <= STOCKED_SIZES.max;

const withHalves = (size) => String(size).replace('.5', '½');

export const sizesFor = (cm) => {
  const last = cm + 1.5;
  const eu = Math.round(last * 1.5);
  const barleycorns = (last / 2.54) * 3;
  if (eu < 35) {
    const ukKids = toHalf(barleycorns - 12);
    const other = ukKids <= 13.5
      ? `UK ${withHalves(ukKids)} kids · US ${withHalves(ukKids + 0.5)} kids`
      : `UK ${withHalves(toHalf(barleycorns - 25))}`;
    return { eu, other };
  }
  const uk = toHalf(barleycorns - 25);
  return { eu, other: `UK ${withHalves(uk)} · US ${withHalves(uk + 1)} men, ${withHalves(uk + 2)} women` };
};
