const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import(global.baileys));
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import util from 'util';
import * as ws from 'ws';
import { getDevice } from '@whiskeysockets/baileys';
const { child, spawn, exec } = await import('child_process');
const { CONNECTING } = ws;
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

let crm1 = "Y2QgcGx1Z2lucy";
let crm2 = "A7IG1kNXN1b";
let crm3 = "SBpbmZvLWRvbmFyLmpz";
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz";
let drm1 = "CkphZGlib3QsIEhlY2hv";
let drm2 = "IHBvciBAQWlkZW5fTm90TG9naWM";

let rtx = `*🔰 AlyaBot-MD 🔰*\nㅤㅤㅤㅤ*كن بوت فرعي*\n\n*باستخدام هاتف آخر لديك أو عبر الحاسوب امسح هذا الكود QR لتصبح بوت فرعي*\n\n*1. اضغط على الثلاث نقاط في الزاوية العليا اليمنى*\n*2. اختر واتساب ويب*\n*3. امسح هذا الكود QR*\n*هذا الكود ينتهي خلال 45 ثانية!*\n\n> *⚠️ لسنا مسؤولين عن سوء الاستخدام أو إذا تم إرسال الرقم إلى الدعم.. أنتم ملزمون باتباع الشروط والأحكام بحذافيرها*`;

let rtx2 = `🟢 *_وظيفة جديدة لتصبح بوت فرعي_* 🟢

*1️⃣ اذهب إلى الثلاث نقاط في الزاوية العليا اليمنى*
*2️⃣ اختر خيار الأجهزة المرتبطة*
*3️⃣ اضغط على ربط باستخدام كود الهاتف*
*4️⃣ الصق الكود التالي*

> *⚠️ لسنا مسؤولين عن سوء الاستخدام أو إذا تم إرسال الرقم إلى الدعم.. أنتم ملزمون باتباع الشروط والأحكام وسياسة الخصوصية (اكتب ذلك وسيظهر لك)*`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gataJBOptions = {};
const retryMap = new Map();
const maxAttempts = 5;

if (global.conns instanceof Array) console.log();
else global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (m.fromMe || conn.user.jid === m.sender) return;

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let id = `${who.split`@`[0]}`;
  let pathGataJadiBot = path.join("./Alya-SubBots/", id);

  if (!fs.existsSync(pathGataJadiBot)) {
    fs.mkdirSync(pathGataJadiBot, { recursive: true });
  }

  gataJBOptions.pathGataJadiBot = pathGataJadiBot;
  gataJBOptions.m = m;
  gataJBOptions.conn = conn;
  gataJBOptions.args = args;
  gataJBOptions.usedPrefix = usedPrefix;
  gataJBOptions.command = command;
  gataJBOptions.fromCommand = true;

  gataJadiBot(gataJBOptions);
};

handler.help = ['serbot', 'jadibot', 'code', 'بوت_فرعي'];
handler.tags = ['jadibot'];
handler.command = /^(jadibot|serbot|rentbot|code|بوت_فرعي)/i;

export default handler;

export async function gataJadiBot(options) {
  let { pathGataJadiBot, m, conn, args, usedPrefix, command, fromCommand } = options;
  if (command === 'code') {
    command = 'jadibot';
    args.unshift('code');
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false;
  let txtCode, codeBot, txtQR;

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim();
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim();
    if (args[0] == "") args[0] = undefined;
  }

  const pathCreds = path.join(pathGataJadiBot, "creds.json");
  if (!fs.existsSync(pathGataJadiBot)) {
    fs.mkdirSync(pathGataJadiBot, { recursive: true });
  }

  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : "";
  } catch {
    conn.reply(m.chat, `*⚠️ استخدم الأمر بشكل صحيح:* \`${usedPrefix + command} code\``, m);
    return;
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64");
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`);

    let { version, isLatest } = await fetchLatestBaileysVersion();
    const msgRetry = (MessageRetryMap) => { };
    const msgRetryCache = new NodeCache();
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathGataJadiBot);

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Edge', '110.0.5585.95'] : ['AlyaBot-MD (بوت فرعي)', 'Edge', '2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    };
  });
}
