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