export const formatName = (nameString) => {
    if (!nameString) {
        return '';
    }
    return nameString.toLowerCase().split(' ').map(word => {
        if (word.length === 0) {
            return '';
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

// Helper to get client initials
export const getClientInitials = (clientName) => {
    if (!clientName) return '??';
    const parts = clientName.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };