# NADF-GUIDE
# Propósito: Pruebas de REQ-002 (historial) sobre la Lambda history en modo local.
# Configuración: No requiere configuración directa; sin TABLE_NAME la Lambda devuelve lista vacía.
import importlib.util
import json
import pathlib
import unittest


APP = pathlib.Path(__file__).parents[1] / "src" / "history.py"
SPEC = importlib.util.spec_from_file_location("sample2_history", APP)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class HistoryTest(unittest.TestCase):
    def test_history_local_empty(self):
        result = MODULE.handler({}, None)
        self.assertEqual(result["statusCode"], 200)
        payload = json.loads(result["body"])
        self.assertEqual(payload["items"], [])
        self.assertEqual(payload["count"], 0)


if __name__ == "__main__":
    unittest.main()
