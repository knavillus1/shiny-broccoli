## Executive Summary
This specification explains how to implement **image‑edit** functionality in Python against the OpenAI *Create image edit* endpoint (`POST https://api.openai.com/v1/images/edits`).  It covers prerequisites, parameter semantics, file‑handling rules, example client code (both with the official `openai` Python SDK and with raw `requests`), response decoding, error handling, performance limits, and compliance considerations.  The guidance is valid for **gpt‑image‑1** and **dall‑e‑2** models as of June 2025.([platform.openai.com](https://platform.openai.com/docs/models/gpt-image-1?utm_source=chatgpt.com), [platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com))  

---

## 1. Architecture Overview
The workflow consists of four stages:
1. **Asset preparation** – load/validate the source image(s) and optional PNG mask; ensure format/size meet model constraints.([community.openai.com](https://community.openai.com/t/gpt-image-1-transparent-backgrounds-with-edit-request/1240577?utm_source=chatgpt.com), [reddit.com](https://www.reddit.com/r/OpenAI/comments/132vx0x/easily_edit_images_with_openai_in_python/?utm_source=chatgpt.com))
2. **Multipart upload** – send a `multipart/form‑data` POST containing the image(s), mask, and structured parameters to the edits endpoint.([community.openai.com](https://community.openai.com/t/file-format-for-upload-parts/939371?utm_source=chatgpt.com))
3. **Result handling** – parse the JSON response; depending on model/parameters either retrieve a presigned URL (valid 60 min) or decode Base‑64 data.([community.openai.com](https://community.openai.com/t/create-image-when-response-format-is-b64-json-how-do-i-know-what-image-format-it-is/46158?utm_source=chatgpt.com), [stackoverflow.com](https://stackoverflow.com/questions/2323128/convert-string-in-base64-to-image-and-save-on-filesystem?utm_source=chatgpt.com))
4. **Post‑processing** – write image(s) to disk, optionally pass through Pillow for further compositing or compression adjustments.

A high‑level component diagram:
```
User ➜ Python client ➜ OpenAI API (images/edits) ➜ CDN / JSON ➜ Storage / UI
```

---

## 2. Prerequisites
### 2.1 Environment
| Item | Minimum | Notes |
|------|---------|-------|
| Python | 3.9 | `requests` handles streaming uploads more efficiently starting 3.9 |
| Packages | `openai>=1.24.0`, `requests>=2.32`, `pillow>=10.3`, `python-dotenv` | Pin versions to avoid breaking API changes |
| Images | PNG, JPG, or WEBP (<50 MB each, ≤ 16 images) for **gpt‑image‑1**; square PNG (<4 MB) for **dall‑e‑2**.([platform.openai.com](https://platform.openai.com/docs/models/gpt-image-1?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/dall-e-3-wont-produce-image-in-sizes-other-than-1024x1024/578773?utm_source=chatgpt.com)) |

Store the secret key as `OPENAI_API_KEY` in your environment or in a `.env` file consumed by **python‑dotenv**.([community.openai.com](https://community.openai.com/t/how-to-load-a-local-image-to-gpt4-vision-using-api/533090?utm_source=chatgpt.com))

### 2.2 Authentication
Use Bearer‑token auth via the `Authorization: Bearer YOUR_KEY` header.  Rotate keys regularly and scope them via separate project‑level secrets for least privilege.([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com))

---

## 3. Endpoint & Parameters
`POST /v1/images/edits` accepts `multipart/form‑data` fields plus optional query parameters.  **Table 1** summarises behaviour.

| Field | Type | Required | Models | Notes |
|-------|------|----------|--------|-------|
| `image` | file[] / file | ✓ | both | Up to 16 for *gpt‑image‑1*; 1 for *dall‑e‑2*.([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com)) |
| `prompt` | string | ✓ | both | 32 k chars (*gpt‑image‑1*) / 1 k (*dall‑e‑2*). |
| `mask` | PNG file | – | both | Same dims as first `image`; shows edit area via alpha 0.([community.openai.com](https://community.openai.com/t/how-to-specify-the-image-in-the-images-edits-api/324355?utm_source=chatgpt.com)) |
| `model` | enum | – | both | Defaults to **dall‑e‑2** unless a *gpt‑image‑1*‑only flag present. |
| `background` | enum | – | gpt‑image‑1 | `transparent | opaque | auto` (default). Requires `output_format` PNG/WEBP if `transparent`.([community.openai.com](https://community.openai.com/t/gpt-image-1-transparent-backgrounds-with-edit-request/1240577?utm_source=chatgpt.com)) |
| `output_format` | enum | – | gpt‑image‑1 | `png (default) | jpeg | webp`. Needed for transparency & compression control. |
| `output_compression` | int 0‑100 | – | gpt‑image‑1 | Only for WEBP/JPEG. |
| `n` | int 1‑10 | – | both | Parallel images per request. |
| `quality` | enum | – | gpt‑image‑1 | `high | medium | low | auto` (default). |
| `size` | enum | – | gpt‑image‑1 | `1024×1024 | 1024×1536 | 1536×1024 | auto`. *dall‑e‑2* supports 256/512/1024 square only.([community.openai.com](https://community.openai.com/t/size-and-ratio-issue-in-dall-e/860233?utm_source=chatgpt.com)) |
| `response_format` | enum | – | dall‑e‑2 | `url (default) | b64_json`. *gpt‑image‑1* always returns base64. |
| `user` | string | – | both | Pass anonymised UUID for abuse tracking. |

---

## 4. Python Implementation
### 4.1 Using the OpenAI Python SDK (recommended)
```python
from openai import OpenAI
from pathlib import Path
client = OpenAI()

resp = client.images.edit(
    model="gpt-image-1",
    prompt="Create a lovely gift basket with these four items in it",
    images=[
        Path("body-lotion.png"),
        Path("bath-bomb.png"),
        Path("incense-kit.png"),
        Path("soap.png")
    ],
    n=2,
    background="transparent",
    output_format="png",
)
# gpt-image-1 ➜ resp.data is a list of dicts with b64_json keys
for i, img_obj in enumerate(resp.data, start=1):
    out_path = Path(f"basket_{i}.png")
    out_path.write_bytes(base64.b64decode(img_obj["b64_json"]))
```
The SDK automatically builds the multipart body and ensures the correct model parameter format.([community.openai.com](https://community.openai.com/t/how-can-i-use-create-image-edit-api/32271?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/create-image-when-response-format-is-b64-json-how-do-i-know-what-image-format-it-is/46158?utm_source=chatgpt.com))

### 4.2 Raw REST with `requests`
```python
import base64, os, requests
API_KEY = os.environ["OPENAI_API_KEY"]
url = "https://api.openai.com/v1/images/edits"
files = [
    ("image[]", ("body-lotion.png", open("body-lotion.png", "rb"), "image/png")),
    ("image[]", ("bath-bomb.png", open("bath-bomb.png", "rb"), "image/png")),
]
# Optional mask → ('mask', ('mask.png', open('mask.png','rb'), 'image/png'))
fields = {
    "model": (None, "gpt-image-1"),
    "prompt": (None, "Create a lovely gift basket with these two items in it"),
    "n": (None, "1"),
    "background": (None, "auto"),
    "output_format": (None, "png")
}
headers = {"Authorization": f"Bearer {API_KEY}"}
resp = requests.post(url, files=files + list(fields.items()), headers=headers, timeout=300)
resp.raise_for_status()
img_b64 = resp.json()["data"][0]["b64_json"]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(img_b64))
```
Use explicit content‑types (`image/png`) to avoid server 400 errors on MIME mismatch.([community.openai.com](https://community.openai.com/t/file-format-for-upload-parts/939371?utm_source=chatgpt.com))

### 4.3 Decoding `b64_json`
```python
import base64, json, pathlib
b64 = json_resp["data"][0]["b64_json"]
pathlib.Path("result.png").write_bytes(base64.b64decode(b64))
```
Base64 decoding is built‑in; remember to open the file in binary write mode.([stackoverflow.com](https://stackoverflow.com/questions/2323128/convert-string-in-base64-to-image-and-save-on-filesystem?utm_source=chatgpt.com), [medium.com](https://medium.com/%40ajeet214/retrieve-your-image-from-base64-format-9c23014624b7?utm_source=chatgpt.com))

---

## 5. Error Handling & Retry Strategy
| HTTP Status | Cause | Suggested Action |
|-------------|-------|------------------|
| `400` | Invalid parameter (e.g., mask dims mismatch) | Validate client‑side; log & surface message to user. |
| `401/403` | Bad or expired API key | Refresh secret; rotate keys. |
| `429` | Rate limit | Exponential backoff (e.g., 2 → 4 → 8 s) and respect `Retry‑After`. |
| `500/502/503` | Service unstable | Retry idempotently; cap attempts at 3. |

Implement retries with [tenacity](https://tenacity.readthedocs.io/) or the built‑in `openai` exponential‑backoff helper.([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/how-can-i-use-create-image-edit-api/32271?utm_source=chatgpt.com))

---

## 6. Performance & Cost Guidance
* Token usage is proportional to **prompt length + image tokens**; each 1024‑pixel image counts as 8 image tokens.([platform.openai.com](https://platform.openai.com/docs/models/gpt-image-1?utm_source=chatgpt.com), [platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com))
* Batching up to `n=10` images in one call reduces per‑request overhead but increases peak latency – empirically ~12‑15 s for 1024×1024 edits.([community.openai.com](https://community.openai.com/t/dall-e-3-wont-produce-image-in-sizes-other-than-1024x1024/578773?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/size-and-ratio-issue-in-dall-e/860233?utm_source=chatgpt.com))
* For high‑throughput pipelines, distribute concurrency across multiple API keys/projects to stay within the 50 req/minute limit (subject to quota).([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com))

---

## 7. Security & Compliance
* **User identification** – supply a pseudonymous user ID in the `user` field for abuse monitoring.([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com))
* **Data retention** – images are stored for 30 days for content policy auditing; avoid sending sensitive personal images.([platform.openai.com](https://platform.openai.com/docs/models/gpt-image-1?utm_source=chatgpt.com))
* **Access control** – store API keys in secure secret‑management (e.g., HashiCorp Vault, AWS SM) and restrict outbound traffic to `api.openai.com` via firewall.([community.openai.com](https://community.openai.com/t/how-to-load-a-local-image-to-gpt4-vision-using-api/533090?utm_source=chatgpt.com))

---

## 8. Testing Checklist
- [ ] Unit tests validate parameter JSON and file count rules.
- [ ] Integration tests assert successful 200 response and valid PNG headers.
- [ ] Negative tests cover oversized mask, mismatched dimensions, and invalid enum values.
- [ ] Regression suite ensures exif rotations are handled (Pillow auto‑orients).([reddit.com](https://www.reddit.com/r/OpenAI/comments/132vx0x/easily_edit_images_with_openai_in_python/?utm_source=chatgpt.com))

---

## 9. Reference cURL Example
```bash
curl -s -o >(jq -r '.data[0].b64_json' | base64 --decode > gift-basket.png) \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -F model=gpt-image-1 \
     -F "image[]=@body-lotion.png" \
     -F "image[]=@bath-bomb.png" \
     -F 'prompt=Create a lovely gift basket with these two items in it' \
     https://api.openai.com/v1/images/edits
```
This mirrors the official docs while piping the decoded image to `gift‑basket.png`.([platform.openai.com](https://platform.openai.com/docs/guides/image-generation?utm_source=chatgpt.com), [community.openai.com](https://community.openai.com/t/how-can-i-use-create-image-edit-api/32271?utm_source=chatgpt.com))

---

## 10. Appendix A – Parameter‑Model Matrix
| Param | dall‑e‑2 | gpt‑image‑1 |
|-------|----------|-------------|
| `background` | – | ✓ |
| `output_format` | – | ✓ |
| `output_compression` | – | ✓ |
| `quality` | `standard` only | `auto | low | medium | high` |
| `response_format` | `url | b64_json` | `b64_json` only |

---

**End of specification**

