/**
 * Thin wrapper around the Rashori REST API.
 * Supports two auth modes:
 *   - BOT mode:  RASHORI_BOT_TOKEN  (agent acts on behalf of a linked user)
 *   - PAT mode:  RASHORI_USER_TOKEN (Personal Access Token — direct user access)
 */

const BASE_URL = process.env.RASHORI_BASE_URL || 'https://www.rashori.com/api';

function authHeaders() {
  const token = process.env.RASHORI_BOT_TOKEN || process.env.RASHORI_USER_TOKEN;
  if (!token) throw new Error('Set RASHORI_BOT_TOKEN or RASHORI_USER_TOKEN in environment.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function isBotMode() {
  return !!process.env.RASHORI_BOT_TOKEN;
}

function defaultUserId() {
  return process.env.RASHORI_USER_ID ? parseInt(process.env.RASHORI_USER_ID) : null;
}

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({ status: false, message: `HTTP ${res.status}` }));
  return { httpStatus: res.status, ...data };
}

// ── Public (no auth) ─────────────────────────────────────────────────────────

export async function searchIdeas({ type, region, page = 1, keyword } = {}) {
  const params = new URLSearchParams({ page });
  if (type)    params.set('type', type);
  if (region)  params.set('region', region);
  if (keyword) params.set('search', keyword);
  const res = await fetch(`${BASE_URL}/get-ideas?${params}`);
  return res.json();
}

export async function getPointsConfig() {
  const res = await fetch(`${BASE_URL}/points-config`);
  return res.json();
}

// ── Bot mode actions ─────────────────────────────────────────────────────────

function botPayload(extra = {}) {
  const uid = defaultUserId();
  if (!uid && !extra.email) throw new Error('Set RASHORI_USER_ID or pass email for claim mode.');
  return uid ? { user_id: uid, ...extra } : extra;
}

export async function createBusiness(params) {
  return api('POST', '/bots/action/create-business', botPayload(params));
}

export async function createIdea(params) {
  return api('POST', '/bots/action/create-idea', botPayload(params));
}

export async function updateIdea(params) {
  return api('POST', '/bots/action/update-idea', botPayload(params));
}

export async function listIdeas(params = {}) {
  return api('POST', '/bots/action/list-ideas', botPayload(params));
}

export async function findMatches(params) {
  return api('POST', '/bots/action/find-matches', botPayload(params));
}

export async function startRound(params) {
  return api('POST', '/bots/action/start-round', botPayload(params));
}

export async function watchIdea(params) {
  return api('POST', '/bots/action/watch-idea', botPayload(params));
}

export async function unwatchIdea(params) {
  return api('POST', '/bots/action/unwatch-idea', botPayload(params));
}

export async function listWatches(params = {}) {
  return api('GET', '/bots/action/list-watches', null);
}

export async function linkedUsers() {
  return api('GET', '/bots/linked-users', null);
}

export async function botStatus() {
  return api('GET', '/bots/status', null);
}
