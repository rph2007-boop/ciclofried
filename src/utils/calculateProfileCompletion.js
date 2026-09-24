export const calculateProfileCompletion = (friend) => {
  if (!friend) return 0;

  const fields = [
    { key: 'name', weight: 15 },
    { key: 'birthday', weight: 10 },
    { key: 'phone', weight: 10 },
    { key: 'address', weight: 10 },
    { key: 'notes', weight: 5 },
    { key: 'meetingPlace', weight: 5 },
  ];

  let score = 0;
  let totalWeight = 0;

  // Check basic fields
  fields.forEach(field => {
    totalWeight += field.weight;
    if (friend[field.key] && friend[field.key].toString().trim().length > 0) {
      score += field.weight;
    }
  });

  // Check Photos
  totalWeight += 15;
  if (friend.photos && friend.photos.length > 0) {
    score += 15;
  }

  // Check Preferences (Arrays)
  // Assuming friend.preferences is an object with arrays: { drinks: [], ... }
  // We check if at least some preferences are set
  totalWeight += 30;
  let hasPreferences = false;
  
  if (friend.preferences) {
    const prefKeys = Object.keys(friend.preferences);
    for (const key of prefKeys) {
      if (Array.isArray(friend.preferences[key]) && friend.preferences[key].length > 0) {
        hasPreferences = true;
        break;
      }
    }
  } else {
      // Legacy check for old fields just in case
      if (friend.drinkPreferences || friend.outingPreferences || friend.moviePreferences || friend.giftWishes) {
          hasPreferences = true;
      }
  }

  if (hasPreferences) {
    score += 30;
  }

  return Math.min(100, Math.round((score / totalWeight) * 100));
};