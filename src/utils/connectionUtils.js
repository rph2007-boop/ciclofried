export const getMutualFriends = (friend1, friend2, allFriends) => {
  if (!friend1 || !friend2 || !allFriends) return [];
  
  const friend1Connections = friend1.connections || [];
  const friend2Connections = friend2.connections || [];
  
  const mutualIds = friend1Connections.filter(id => friend2Connections.includes(id));
  
  return allFriends.filter(f => mutualIds.includes(f.id));
};

export const getConnectionCount = (friend) => {
  return friend?.connections?.length || 0;
};

export const validateConnection = (friendId, connectedFriendId, friends) => {
  if (friendId === connectedFriendId) {
    return { valid: false, message: 'Cannot connect a friend to themselves' };
  }
  
  const friend = friends.find(f => f.id === friendId);
  if (!friend) {
    return { valid: false, message: 'Friend not found' };
  }
  
  if (friend.connections.includes(connectedFriendId)) {
    return { valid: false, message: 'Friends are already connected' };
  }
  
  return { valid: true };
};

export const getTotalConnections = (friends) => {
  if (!friends || friends.length === 0) return 0;
  const total = friends.reduce((sum, friend) => sum + (friend.connections?.length || 0), 0);
  return Math.floor(total / 2);
};