const numFormatter = Intl.NumberFormat('en-us', {
  notation: 'compact'
});
export const numFmt = (val: number) => numFormatter.format(val);
