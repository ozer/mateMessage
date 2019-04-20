export const getInitials = mate => {
  if (mate && mate.name) {
    const { name } = mate;
    let words = name.split(' ');
    if (words.length >= 2) {
        const firstName = words[0];
        const lastName = words.slice(-1)[0];
        console.log('lastName -> ', lastName);
        console.log('lastName slice - > ', lastName.slice(0, 1));
        return firstName.slice(0, 1).concat(lastName.slice(0, 1));
    }
    return words.join('').slice(0, 2);
  }
  return '';
};
