"""Sample 1: minimal customer-visible Lambda application."""
import json


def response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }


def handler(event, _context):
    path = event.get("rawPath") or event.get("path") or "/"
    if path == "/health":
        return response(200, {"status": "ok", "service": "nadf-sample1"})
    if path == "/":
        return response(
            200,
            {
                "message": "NADF Sample 1",
                "purpose": "GitHub Issue → governed change → AWS DEV",
            },
        )
    return response(404, {"error": "not_found", "path": path})
