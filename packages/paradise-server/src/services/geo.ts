import GeoNames from 'geode';
import { promisify } from 'util';
import config from './config';

enum Method {
  'search' = 'search',
  'get' = 'get',
  'postalCode' = 'postalCode',
  'postalCodeLookup' = 'postalCodeLookup',
  'findNearbyPostalCodes' = 'findNearbyPostalCodes',
  'postalCodeCountryInfo' = 'postalCodeCountryInfo',
  'findNearbyPlaceName' = 'findNearbyPlaceName',
  'findNearby' = 'findNearby',
  'extendedFindNearby' = 'extendedFindNearby',
  'children' = 'children',
  'hierarchy' = 'hierarchy',
  'neighbours' = 'neighbours',
  'siblings' = 'siblings',
  'findNearbyWikipedia' = 'findNearbyWikipedia',
  'wikipediaSearch' = 'wikipediaSearch',
  'wikipediaBoundingBox' = 'wikipediaBoundingBox',
  'cities' = 'cities',
  'earthquakes' = 'earthquakes',
  'weather' = 'weather',
  'weatherIcaoJSON' = 'weatherIcaoJSON',
  'findNearByWeather' = 'findNearByWeather',
  'countryInfo' = 'countryInfo',
  'countryCode' = 'countryCode',
  'countrySubdivision' = 'countrySubdivision',
  'ocean' = 'ocean',
  'neighbourhood' = 'neighbourhood',
  'srtm3' = 'srtm3',
  'astergdem' = 'astergdem',
  'gtopo30' = 'gtopo30',
  'timezone' = 'timezone',
}

export type Geode = Record<Method, (...args: any[]) => Promise<any>>;

const geode: Geode = new GeoNames(config.get('thirdParty.geonames'));

Object.keys(Method).forEach((method) => {
  (geode as any)[method] = promisify((geode as any)[method].bind(geode));
});

export default geode;
