from groq import Groq
import json
import os

api_key = os.getenv("GROQ_API_KEY")
# Initialize client only if API key is found to prevent startup crash
if api_key:
    print(f"LLM Initialized with Key: {api_key[:8]}...{api_key[-4:]}")

client = Groq(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """
You are an expert meeting analyst.

Analyze the meeting transcript and return STRICT JSON with:
- summary
- key_points (list)
- decisions (list)
- action_items (list of {task, owner, due_date})
- agenda (topic-wise breakdown)

If owner or due_date is not mentioned, use null.
Do NOT add extra text outside JSON.
"""

def transcribe_audio(file_path: str):
    if not client:
        return "Error: GROQ_API_KEY not found."
    
    try:
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3",
                response_format="json"
            )
        return transcription.text
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"

def generate_meeting_summary(transcript: str):
    if not client:
        return {
            "summary": "Error: GROQ_API_KEY not found. Please set it in your environment variables.",
            "key_points": [],
            "decisions": [],
            "action_items": [],
            "agenda": []
        }

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": transcript}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content
    except Exception as e:
        return {
            "summary": f"Groq API Error: {str(e)}",
            "key_points": [],
            "decisions": [],
            "action_items": [],
            "agenda": []
        }
    

    if content.startswith("```json"):
        content = content.replace("```json", "").replace("```", "")
    elif content.startswith("```"):
        content = content.replace("```", "")
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "summary": "Error parsing AI response. The model output was not valid JSON.",
            "key_points": [],
            "decisions": [],
            "action_items": [],
            "agenda": []
        }
