"""Sample 2: calculator with optional DynamoDB audit persistence."""
import json
import os
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


def handler(event, _context):
    try:
        body = json.loads(event.get("body") or "{}")
        value = calculate(
            str(body["operation"]),
            Decimal(str(body["left"])),
            Decimal(str(body["right"])),
        )
        result = {"result": str(value), "operation": body["operation"]}
        table_name = os.getenv("TABLE_NAME")
        if table_name:
            import boto3
            boto3.resource("dynamodb").Table(table_name).put_item(Item=result)
        return {"statusCode": 200, "body": json.dumps(result)}
    except (KeyError, ValueError, json.JSONDecodeError) as error:
        return {"statusCode": 400, "body": json.dumps({"error": str(error)})}
