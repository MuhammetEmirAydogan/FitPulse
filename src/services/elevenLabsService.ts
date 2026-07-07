/**
 * ElevenLabs Text-to-Speech Service
 *
 * React Native'de fetch+blob güvenilir çalışmadığı için,
 * XMLHttpRequest ile arraybuffer kullanarak ses dosyasını alıyoruz.
 * expo-file-system/legacy import — cacheDirectory ve writeAsStringAsync burada.
 */
import {
  cacheDirectory,
  writeAsStringAsync,
  readDirectoryAsync,
  deleteAsync,
} from 'expo-file-system/legacy';

// ─── API Key ───────────────────────────────────────────────────────────────
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';

const API_BASE = 'https://api.elevenlabs.io/v1';
// ElevenLabs ses modeli: düşük gecikmeli, doğal (robotik olmayan) seslendirme.
const MODEL_ID = 'eleven_turbo_v2_5';

// ─── Ses Seçenekleri ───────────────────────────────────────────────────────
export interface VoiceOption {
  id: string;
  name: string;
  nameEn: string;
  gender: 'female' | 'male';
  style: string;
  styleEn: string;
  icon: string;
}

// Meditasyon için 8 hazır ses (4 kadın + 4 erkek); kullanıcı arayüzden seçer.
export const ELEVENLABS_VOICES: VoiceOption[] = [
  // Kadın Sesler
  {
    id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    nameEn: 'Matilda',
    gender: 'female',
    style: 'Doğal & Akıcı',
    styleEn: 'Natural & Flowing',
    icon: '🍃',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    nameEn: 'Sarah',
    gender: 'female',
    style: 'Olgun & Güven Verici',
    styleEn: 'Mature & Reassuring',
    icon: '🌸',
  },
  {
    id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'Alice',
    nameEn: 'Alice',
    gender: 'female',
    style: 'Açık & Anlaşılır',
    styleEn: 'Clear & Engaging',
    icon: '✨',
  },
  {
    id: 'hpp4J3VqNfWAUOO0d1Us',
    name: 'Bella',
    nameEn: 'Bella',
    gender: 'female',
    style: 'Sıcak & Profesyonel',
    styleEn: 'Warm & Professional',
    icon: '🌙',
  },
  // Erkek Sesler
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    nameEn: 'Daniel',
    gender: 'male',
    style: 'Sakin & Otoriter',
    styleEn: 'Calm & Authoritative',
    icon: '🎙️',
  },
  {
    id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    nameEn: 'Liam',
    gender: 'male',
    style: 'Genç & Enerjik',
    styleEn: 'Young & Energetic',
    icon: '⚡',
  },
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    nameEn: 'Brian',
    gender: 'male',
    style: 'Derin & Rahatlatıcı',
    styleEn: 'Deep & Comforting',
    icon: '🌊',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    nameEn: 'Adam',
    gender: 'male',
    style: 'Güçlü & Kararlı',
    styleEn: 'Dominant & Firm',
    icon: '🏔️',
  },
];

// ─── Byte array → Base64 (Saf JS Sürümü - btoa bağımlılığı yok) ─────────────
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = '';
  const l = bytes.length;
  let i = 0;
  for (i = 0; i < l - 2; i += 3) {
    result += BASE64_CHARS[bytes[i] >> 2];
    result += BASE64_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    result += BASE64_CHARS[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    result += BASE64_CHARS[bytes[i + 2] & 63];
  }
  if (i < l) {
    result += BASE64_CHARS[bytes[i] >> 2];
    if (i === l - 1) {
      result += BASE64_CHARS[(bytes[i] & 3) << 4];
      result += '==';
    } else {
      result += BASE64_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      result += BASE64_CHARS[(bytes[i + 1] & 15) << 2];
      result += '=';
    }
  }
  return result;
}

// ─── Önbellek temizliği ─────────────────────────────────────────────────────
async function cleanCacheDirectory() {
  try {
    const dir = cacheDirectory;
    if (!dir) return;
    const files = await readDirectoryAsync(dir);
    for (const file of files) {
      if ((file.startsWith('meditation_') || file.startsWith('preview_')) && file.endsWith('.mp3')) {
        await deleteAsync(dir + file, { idempotent: true });
      }
    }
  } catch (err) {
    console.warn('[ElevenLabs] Cache cleanup error:', err);
  }
}

// ─── TTS API Çağrısı ──────────────────────────────────────────────────────
/**
 * ElevenLabs TTS API'sini çağırır ve ses dosyasını cache dizinine kaydeder.
 * React Native'de güvenilir çalışması için XMLHttpRequest + arraybuffer kullanır.
 * expo-file-system/legacy → cacheDirectory + writeAsStringAsync('base64')
 *
 * @returns Kaydedilen dosyanın file:// URI'si
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  filename: string = 'meditation_audio.mp3'
): Promise<string> {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.length < 10) {
    throw new Error('ElevenLabs API anahtarı bulunamadı');
  }

  // Önceki meditasyon/önizleme ses dosyalarını temizle
  await cleanCacheDirectory();

  console.log('[ElevenLabs] generateSpeech started. text length:', text.length, 'voiceId:', voiceId);

  const url = `${API_BASE}/text-to-speech/${voiceId}?output_format=mp3_22050_32&optimize_streaming_latency=3`;

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('xi-api-key', ELEVENLABS_API_KEY);

    xhr.onload = async () => {
      console.log('[ElevenLabs] HTTP response status:', xhr.status);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const arrayBuffer = xhr.response as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          console.log('[ElevenLabs] Binary received. bytes length:', bytes.length);
          const base64 = uint8ArrayToBase64(bytes);
          console.log('[ElevenLabs] Binary converted to base64. base64 length:', base64.length);

          // cacheDirectory her zaman / ile biter
          const fileUri = (cacheDirectory ?? '') + filename;
          console.log('[ElevenLabs] Writing base64 to fileUri:', fileUri);

          // 'base64' string literal — EncodingType enum undefined olabilir
          await writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
          console.log('[ElevenLabs] Write string async finished successfully.');

          resolve(fileUri);
        } catch (writeErr) {
          console.error('[ElevenLabs] File write error:', writeErr);
          reject(new Error(`Ses dosyası kaydedilemedi: ${writeErr}`));
        }
      } else {
        // API hata mesajını parse et
        let errorMsg = `ElevenLabs API hatası (${xhr.status})`;
        try {
          const errBytes = new Uint8Array(xhr.response as ArrayBuffer);
          const errorText = new TextDecoder('utf-8').decode(errBytes);
          const errorJson = JSON.parse(errorText);
          if (errorJson?.detail?.message) {
            errorMsg = errorJson.detail.message;
          }
        } catch {
          // parse edilemezse generic mesaj kullan
        }
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Ağ hatası: ElevenLabs servisine bağlanılamadı'));
    };

    xhr.ontimeout = () => {
      reject(new Error('İstek zaman aşımına uğradı (60s)'));
    };

    xhr.timeout = 60000;

    xhr.send(
      JSON.stringify({
        text,
        model_id: MODEL_ID,
        // Ses ayarları: kararlılık / benzerlik / stil dengesi (daha doğal anlatım için).
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      })
    );
  });
}

/**
 * Kısa bir önizleme metni ile ses üretir.
 * Preview dosyaları voiceId bazlı önbelleğe alınır.
 */
export async function generatePreview(
  voiceId: string,
  language: string = 'tr'
): Promise<string> {
  const previewText =
    language === 'tr'
      ? 'Merhaba, bu ses ile meditasyonunuzu dinleyeceksiniz. Derin bir nefes alın ve rahatlayın.'
      : 'Hello, this is the voice for your meditation. Take a deep breath and relax.';

  return generateSpeech(previewText, voiceId, `preview_${voiceId}_${Date.now()}.mp3`);
}

/**
 * Ses ID'sinden VoiceOption bilgisini bulur.
 */
export function getVoiceById(id: string): VoiceOption | undefined {
  return ELEVENLABS_VOICES.find((v) => v.id === id);
}
