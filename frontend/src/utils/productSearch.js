export const normalizeSearchText = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const editDistance = (first, second, limit) => {
  if (Math.abs(first.length - second.length) > limit) return limit + 1;
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= second.length; column += 1) {
      const cost = first[row - 1] === second[column - 1] ? 0 : 1;
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + cost,
      );
      rowMinimum = Math.min(rowMinimum, current[column]);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }

  return previous[second.length];
};

const getTokenMatchScore = (query, word) => {
  if (word === query) return 0;
  if (word.startsWith(query)) return 1 + (word.length - query.length) * 0.05;
  if (query.length <= 2) return null;
  if (word.includes(query)) return 8 + word.indexOf(query) * 0.1;

  const maxDistance = query.length >= 6 ? 2 : 1;
  let bestDistance = maxDistance + 1;
  const minLength = Math.max(1, query.length - maxDistance);
  const maxLength = Math.min(word.length, query.length + maxDistance);

  for (let length = minLength; length <= maxLength; length += 1) {
    for (let start = 0; start + length <= word.length; start += 1) {
      bestDistance = Math.min(
        bestDistance,
        editDistance(query, word.slice(start, start + length), maxDistance),
      );
      if (bestDistance === 0) return 0;
    }
  }

  return bestDistance <= maxDistance ? 12 + bestDistance : null;
};

export const getProductSearchScore = (fields, query) => {
  const queryTerms = normalizeSearchText(query).split(' ').filter(Boolean);
  if (!queryTerms.length) return 0;

  const fieldWeights = [0, 35, 20, 15];
  const normalizedFields = fields.map((field) => normalizeSearchText(field));
  let score = 0;

  for (const term of queryTerms) {
    const termScore = normalizedFields.reduce((best, field, index) => {
      const words = field.split(' ').filter(Boolean);
      const weight = fieldWeights[index] ?? 40;
      const wordScore = words.reduce((bestWordScore, word) => {
        const matchScore = getTokenMatchScore(term, word);
        return matchScore === null ? bestWordScore : Math.min(bestWordScore, matchScore);
      }, Infinity);
      const phraseScore = term.length > 2 && field.includes(term)
        ? 5 + field.indexOf(term) * 0.01
        : Infinity;
      return Math.min(best, weight + wordScore, weight + phraseScore);
    }, Infinity);
    if (!Number.isFinite(termScore)) return null;
    score += termScore;
  }

  const fullQuery = queryTerms.join(' ');
  const exactNameMatch = normalizedFields[0] === fullQuery;
  const nameStartsWithQuery = normalizedFields[0].startsWith(fullQuery);
  if (exactNameMatch) return score - 2;
  if (nameStartsWithQuery) return score - 1;
  return score;
};
