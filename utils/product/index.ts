import { IClassification } from "@/types/classification";

export const getCheapestClassification = (
  classifications: IClassification[]
) => {
  if (!classifications || classifications.length === 0) return null;

  return classifications.reduce((cheapest, current) => {
    // Ensure both current and cheapest have a defined price before comparison
    if (
      current?.price !== undefined &&
      (cheapest?.price === undefined || current.price < cheapest.price)
    ) {
      return current;
    }
    return cheapest;
  }, null as IClassification | null);
};
