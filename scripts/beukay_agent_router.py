#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Any, Dict

BASE_URL = "http://127.0.0.1:30000"
PATHS = {
    "video-deconstruction-url": "/videoDeconstruction/understandingTask/url",
    "content-structure-card": "/contentStructureCard/generate",
    "script-blueprint": "/scriptBlueprint/generate",
    "video-assembly": "/videoAssembly/generate",
    "qianchuan-delivery": "/agentRegistry/invoke",
    "qianchuan-data": "/agentRegistry/invoke",
}


def post(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        BASE_URL + path,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            text = response.read().decode("utf-8")
            return json.loads(text)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        return {
            "success": False,
            "status": exc.code,
            "errorMessage": f"HTTP {exc.code}",
            "raw": raw,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "success": False,
            "errorMessage": str(exc),
        }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("tool", choices=PATHS.keys())
    parser.add_argument("--payload-json", required=True)
    args = parser.parse_args()

    try:
        payload = json.loads(args.payload_json)
    except json.JSONDecodeError as exc:
        print(json.dumps({
            "success": False,
            "errorMessage": f"payload-json 不是合法 JSON: {exc}",
        }, ensure_ascii=False, indent=2))
        return 0

    if args.tool == "script-blueprint" and "marketingGoal" not in payload:
        payload["marketingGoal"] = "SEEDING"
    if args.tool == "qianchuan-delivery":
        payload = {
            "agentUniqueId": "qianchuan-delivery-v1",
            "message": payload.get("message") or payload.get("prompt") or "",
            "history": payload.get("history") or [],
        }
    if args.tool == "qianchuan-data":
        payload = {
            "agentUniqueId": "qianchuan-data-v1",
            "message": payload.get("message") or payload.get("prompt") or "",
            "history": payload.get("history") or [],
        }

    result = post(PATHS[args.tool], payload)
    print(json.dumps({
        "tool": args.tool,
        "request": payload,
        "success": bool(result.get("success")),
        "errorMessage": result.get("errorMessage") or result.get("msg") or result.get("message"),
        "data": result.get("data"),
        "raw": result,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
