export class SmoothCompare 
{
  static EPS = 1.0E-13;  // calculated by calcEps() below

  // Compare two decimals taking into account the potential error.
  // Take care: truncation errors accumulate on calculation. More you do, more you should increase the epsilon.
  static aboutEquals(value1, value2) 
  {
    if (Number.POSITIVE_INFINITY === value1)
      return Number.POSITIVE_INFINITY === value2;

    if (Number.NEGATIVE_INFINITY === value1)
      return Number.NEGATIVE_INFINITY === value2;

    if (Number.isNaN(value1))
      return Number.isNaN(value2);

    // works fine for values larger than 1.0 but will fail if both values are 'small'
    // but greater than EPS.
    // so you have to take at least the max of {1.0, values1, value2} !
    let epsilon = Math.max(1.0, Math.max(Math.abs(value1), Math.abs(value2))) * SmoothCompare.EPS;
    let val = Math.abs(value1 - value2);
    return val <= epsilon;
  }

  static calcEps() 
  {  // Maschinengenauigkeit
    let eps = 1.0;

    do { eps /= 2.0; }
    while (1.0 + eps !== 1.0);

    return 2.0 * eps;
  }
}
