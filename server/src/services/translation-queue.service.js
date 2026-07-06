const { Queue, Worker } = require('bullmq');
const { translateMultilingualFields } = require('./translate.service');
const db = require('../config/database');
const logger = require('../utils/logger');

const connection = { url: process.env.REDIS_URL || 'redis://redis:6379' };

const translationQueue = new Queue('translation', { connection });

const worker = new Worker('translation', async (job) => {
  const { table, id, fields, sourceLang } = job.data;

  logger.info(`Translating ${table}:${id} - fields: ${Object.keys(fields).join(', ')}`);

  const translated = await translateMultilingualFields(fields, sourceLang);

  const existing = await db(table).where('id', id).first();
  if (!existing) {
    logger.warn(`Record ${table}:${id} not found, skipping translation`);
    return { success: false, reason: 'not_found' };
  }

  const merged = {};
  for (const [field, translations] of Object.entries(translated)) {
    const existingField = existing[field];
    if (existingField && typeof existingField === 'object') {
      merged[field] = { ...translations, ...existingField };
    } else {
      merged[field] = translations;
    }
  }

  await db(table).where('id', id).update(merged);
  logger.info(`Translation completed for ${table}:${id} - fields: ${Object.keys(merged).join(', ')}`);

  return { success: true, translatedFields: Object.keys(merged) };
}, { connection, concurrency: 2 });

worker.on('failed', (job, err) => {
  logger.error(`Translation job ${job.id} failed: ${err.message}`);
});

worker.on('completed', (job) => {
  logger.debug(`Translation job ${job.id} completed`);
});

async function enqueueTranslation(table, id, fields, sourceLang = 'vi') {
  return translationQueue.add('translate', {
    table, id, fields, sourceLang
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50
  });
}

async function getQueueStatus() {
  const waiting = await translationQueue.getWaitingCount();
  const active = await translationQueue.getActiveCount();
  const completed = await translationQueue.getCompletedCount();
  const failed = await translationQueue.getFailedCount();
  return { waiting, active, completed, failed };
}

module.exports = { translationQueue, enqueueTranslation, getQueueStatus };
