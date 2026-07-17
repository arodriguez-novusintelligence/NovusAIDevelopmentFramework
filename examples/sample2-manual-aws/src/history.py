# NADF-GUIDE
# Propósito: Implementa la Lambda de historial (GET /history) leyendo DynamoDB.
# Configuración: TABLE_NAME opcional; sin ella devuelve lista vacía (modo local).
"""Sample 2 history Lambda: REST /history."""
import json
import os


def handler(_event, _context):
    table_name = os.getenv("TABLE_NAME")
    items: list[dict] = []
    if table_name:
        import boto3
        result = boto3.resource("dynamodb").Table(table_name).scan(Limit=50)
        items = result.get("Items", [])
    return {
        "statusCode": 200,
        "headers": {"content-type": "application/json; charset=utf-8"},
        "body": json.dumps({"items": items, "count": len(items)}, ensure_ascii=False, default=str),
    }
