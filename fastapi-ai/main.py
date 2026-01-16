from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

# OpenAI 클라이언트 (환경변수에서 키 읽음)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize")
def summarize(req: SummarizeRequest):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "너는 한국어 요약 전문가야."},
            {"role": "user", "content": req.text}
        ],
        temperature=0.3
    )

    return {
        "summary": response.choices[0].message.content
    }
