// Sport icons mapping - returns appropriate icon name for Ionicons
export const getSportIcon = (sportName) => {
  if (!sportName) return 'trophy';
  
  const name = sportName.toLowerCase();
  
  if (name.includes('football') || name.includes('soccer')) return 'football';
  if (name.includes('basketball')) return 'basketball';
  if (name.includes('tennis')) return 'tennisball';
  if (name.includes('pickleball')) return 'tennisball';
  if (name.includes('padel')) return 'tennisball';
  if (name.includes('golf')) return 'golf';
  if (name.includes('baseball')) return 'baseball';
  if (name.includes('american football')) return 'american-football';
  if (name.includes('cricket')) return 'fitness';
  if (name.includes('hockey')) return 'fitness';
  if (name.includes('volleyball')) return 'fitness';
  if (name.includes('swimming')) return 'water';
  if (name.includes('cycling') || name.includes('bike')) return 'bicycle';
  if (name.includes('running') || name.includes('track')) return 'walk';
  if (name.includes('boxing') || name.includes('mma') || name.includes('martial')) return 'fitness';
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return 'barbell';
  if (name.includes('yoga')) return 'body';
  if (name.includes('badminton')) return 'tennisball';
  if (name.includes('table tennis') || name.includes('ping pong')) return 'tennisball';
  if (name.includes('ski')) return 'snow';
  if (name.includes('surf')) return 'water';
  
  return 'trophy';
};

// Sport emoji mapping
export const getSportEmoji = (sportName) => {
  if (!sportName) return '🏆';
  
  const name = sportName.toLowerCase();
  
  if (name.includes('football') || name.includes('soccer')) return '⚽';
  if (name.includes('basketball')) return '🏀';
  if (name.includes('tennis')) return '🎾';
  if (name.includes('pickleball')) return '🏓';
  if (name.includes('padel')) return '🎾';
  if (name.includes('golf')) return '⛳';
  if (name.includes('baseball')) return '⚾';
  if (name.includes('american football')) return '🏈';
  if (name.includes('cricket')) return '🏏';
  if (name.includes('hockey')) return '🏒';
  if (name.includes('volleyball')) return '🏐';
  if (name.includes('swimming')) return '🏊';
  if (name.includes('cycling') || name.includes('bike')) return '🚴';
  if (name.includes('running') || name.includes('track')) return '🏃';
  if (name.includes('boxing')) return '🥊';
  if (name.includes('mma') || name.includes('martial')) return '🥋';
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return '💪';
  if (name.includes('yoga')) return '🧘';
  if (name.includes('badminton')) return '🏸';
  if (name.includes('table tennis') || name.includes('ping pong')) return '🏓';
  if (name.includes('ski')) return '⛷️';
  if (name.includes('surf')) return '🏄';
  if (name.includes('rugby')) return '🏉';
  if (name.includes('bowling')) return '🎳';
  if (name.includes('archery')) return '🏹';
  if (name.includes('fencing')) return '🤺';
  if (name.includes('horse') || name.includes('equestrian')) return '🏇';
  if (name.includes('skating')) return '⛸️';
  if (name.includes('snowboard')) return '🏂';
  if (name.includes('climbing')) return '🧗';
  if (name.includes('wrestling')) return '🤼';
  
  return '🏆';
};

export default { getSportIcon, getSportEmoji };
