import axios from 'axios';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

export async function verifyRNLicense(licenseNumber, lastName) {
  const cacheKey = `brn:rn:${licenseNumber}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const response = await axios.get(`${process.env.BRN_BASE_URL}/licenseSearch`, {
      params: { licenseType: 'RN', licenseNumber, lastName },
      timeout: 8000,
    });

    const result = {
      verified: response.data.status === 'ACTIVE',
      status: response.data.status,
      expiryDate: response.data.expirationDate,
      licenseNumber: response.data.licenseNumber,
      hasDiscipline: response.data.disciplineFlag === 'Y',
      source: 'CA_BRN',
      verifiedAt: new Date().toISOString(),
    };

    await redis.setex(cacheKey, 86400, JSON.stringify(result));
    return result;
  } catch (err) {
    logger.warn({ err, licenseNumber }, 'BRN RN verification failed');
    return { verified: false, error: 'verification_unavailable', source: 'CA_BRN' };
  }
}

export async function verifyLVNLicense(licenseNumber, lastName) {
  const cacheKey = `brn:lvn:${licenseNumber}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const response = await axios.get(`${process.env.BRN_BASE_URL}/licenseSearch`, {
      params: { licenseType: 'LVN', licenseNumber, lastName },
      timeout: 8000,
    });

    const result = {
      verified: response.data.status === 'ACTIVE',
      status: response.data.status,
      expiryDate: response.data.expirationDate,
      hasDiscipline: response.data.disciplineFlag === 'Y',
      source: 'CA_BRN',
      verifiedAt: new Date().toISOString(),
    };

    await redis.setex(cacheKey, 86400, JSON.stringify(result));
    return result;
  } catch (err) {
    logger.warn({ err, licenseNumber }, 'BRN LVN verification failed');
    return { verified: false, error: 'verification_unavailable', source: 'CA_BRN' };
  }
}

export async function verifyNPI(npiNumber) {
  const cacheKey = `npi:${npiNumber}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await axios.get(
    `${process.env.NPI_BASE_URL}/?number=${npiNumber}&version=2.1`,
    { timeout: 8000 },
  );

  const record = response.data.results?.[0];
  const result = {
    verified: !!record,
    npiNumber: record?.number,
    taxonomyCode: record?.taxonomies?.[0]?.code,
    taxonomyDesc: record?.taxonomies?.[0]?.desc,
    source: 'CMS_NPI',
    verifiedAt: new Date().toISOString(),
  };

  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  return result;
}

// Dispatcher used by license add flow and nightly sync
export async function verify(licenseType, licenseNumber, lastName) {
  switch (licenseType) {
    case 'rn': return verifyRNLicense(licenseNumber, lastName);
    case 'lvn': return verifyLVNLicense(licenseNumber, lastName);
    case 'npi': return verifyNPI(licenseNumber);
    default:
      return { verified: false, error: 'unsupported_license_type', source: 'none' };
  }
}
