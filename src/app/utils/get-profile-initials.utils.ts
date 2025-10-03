/**
 * Gets the initials of the profiles names for the avatar
 */
export function globalGetInitials(name: string): string {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }
}

/**
 * Gets randoms profile color for the initials of the avatar
 */
export function globalGetInitialsColorClass(name: string): string {
  if (!name) return 'bg-avatar-0';
  const colorsCount = 12;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorsCount;
  return `bg-avatar-${index}`;
}
