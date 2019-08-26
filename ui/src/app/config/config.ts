/**
 * @ignore
 */
const config: object = {
  'USD': {
    'currency_symbol': '',
    'currency': 'ERC-20'
  }
};
/**
 * Config class to set the default curreny
 */
export class Config {
  currency: string;
  constructor (_currency) {
    Object.assign(this, config[_currency || 'ERC-20']);
  }

  /**
	 * Method to set the currency value.
	 * @param _currency
	 */
  setCurrency (_currency) {
    Object.assign(this, config[_currency]);
  }
}
