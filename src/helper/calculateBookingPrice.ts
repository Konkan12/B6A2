const calculateBookingPrice = (
  startDate: string,
  endDate: string,
  price: number
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const totalDays =
    Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const totalCost = totalDays * price;
  return totalCost;
};

export default calculateBookingPrice;