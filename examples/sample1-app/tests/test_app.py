# NADF-GUIDE
# Propósito: Implementa test app.
# Configuración: No requiere configuración directa; conservar rutas relativas y ejecución determinista.
import importlib.util
import pathlib
import unittest


APP = pathlib.Path(__file__).parents[1] / "src" / "app.py"
SPEC = importlib.util.spec_from_file_location("sample1_app", APP)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class AppTest(unittest.TestCase):
    def test_health(self):
        result = MODULE.handler({"rawPath": "/health"}, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertIn('"status": "ok"', result["body"])

    def test_unknown_path(self):
        self.assertEqual(MODULE.handler({"rawPath": "/missing"}, None)["statusCode"], 404)


if __name__ == "__main__":
    unittest.main()
