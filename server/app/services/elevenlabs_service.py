"""
ElevenLabs TTS service — stub.

Flow when implemented:
1. Receive text + language
2. Call ElevenLabs API to generate MP3
3. Upload MP3 to Supabase Storage at path:
   projects/{project_id}/alerts/{alert_id}/{lang}.mp3
4. Return public URL
5. Caller updates alert/context_item row with audio_url + audio_status=ready
"""

from app.config import settings


async def generate_audio(text: str, language: str, project_id: str, entity_type: str, entity_id: str) -> str | None:
    if not settings.elevenlabs_api_key:
        return None
    # TODO: implement ElevenLabs API call + Supabase Storage upload
    raise NotImplementedError("ElevenLabs audio generation not yet implemented")
