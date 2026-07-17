# NADF-GUIDE
# Propósito: Implementa la Lambda de cálculo (POST /calculate) y salud (GET /health).
# Configuración: TABLE_NAME opcional para persistir en DynamoDB; sin ella opera en modo local.
"""Sample 2 calculator Lambda: REST /calculate and /health."""
import json
import os
import time
from decimal import Decimal


def calculate(operation: str, left: Decimal, right: Decimal) -> Decimal:
    if operation == "add":
        return left + right
    if operation == "subtract":
        return left - right
    if operation == "multiply":
        return left * right
    if operation == "divide":
        if right == 0:
            raise ValueError("division_by_zero")
        return left / right
    raise ValueError("unsupported_operation")


def response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"content-type": "application/json; charset=utf-8"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def handler(event, _context):
    path = event.get("rawPath") or event.get("path") or "/"
    if path == "/health":
        return response(200, {"status": "ok", "service": "sample2-calculator"})
    try:
        body = json.loads(event.get("body") or "{}")
        value = calculate(
            str(body["operation"]),
            Decimal(str(body["left"])),
            Decimal(str(body["right"])),
        )
        item = {
            "id": f"calc-{int(time.time() * 1000)}",
            "operation": str(body["operation"]),
            "left": str(body["left"]),
            "right": str(body["right"]),
            "result": str(value),
        }
        table_name = os.getenv("TABLE_NAME")
        if table_name:
            import boto3
            boto3.resource("dynamodb").Table(table_name).put_item(Item=item)
        return response(200, {"result": str(value), "operation": item["operation"], "id": item["id"]})
    except (KeyError, ValueError, json.JSONDecodeError) as error:
        return response(400, {"error": str(error)})
