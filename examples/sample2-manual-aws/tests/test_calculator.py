# NADF-GUIDE
# Propósito: Pruebas de REQ-001 (cálculo) y REQ-003 (health) sobre la Lambda calculator.
# Configuración: No requiere configuración directa; conservar rutas relativas y ejecución determinista.
import importlib.util
import json
import pathlib
import unittest


APP = pathlib.Path(__file__).parents[1] / "src" / "calculator.py"
SPEC = importlib.util.spec_from_file_location("sample2_calculator", APP)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CalculatorTest(unittest.TestCase):
    def invoke(self, operation, left, right):
        event = {
            "rawPath": "/calculate",
            "body": json.dumps({"operation": operation, "left": left, "right": right}),
        }
        return MODULE.handler(event, None)

    def test_add(self):
        result = self.invoke("add", 2, 3)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(json.loads(result["body"])["result"], "5")

    def test_division_by_zero(self):
        self.assertEqual(self.invoke("divide", 1, 0)["statusCode"], 400)

    def test_health(self):
        result = MODULE.handler({"rawPath": "/health"}, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(json.loads(result["body"])["status"], "ok")


if __name__ == "__main__":
    unittest.main()
