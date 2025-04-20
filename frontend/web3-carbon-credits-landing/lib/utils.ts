import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to shorten Ethereum addresses
export const shortenAddress = (address?: `0x${string}` | string | null, chars = 4): string => {
  if (!address) {
    return "";
  }
  const parsed = address;
  if (parsed.length <= chars * 2 + 2) {
    return parsed;
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(address.length - chars)}`;
};
