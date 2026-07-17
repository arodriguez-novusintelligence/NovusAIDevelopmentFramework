import importlib.util
import json
import pathlib
import unittest


APP = pathlib.Path(__file__).parents[1] / "src" / "app.py"
SPEC = importlib.util.spec_from_file_location("sample2_app", APP)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CalculatorTest(unittest.TestCase):
    def invoke(self, operation, left, right):
        event = {"body": json.dumps({"operation": operation, "left": left, "right": right})}
        return MODULE.handler(event, None)

    def test_add(self):
        result = self.invoke("add", 2, 3)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(json.loads(result["body"])["result"], "5")

    def test_division_by_zero(self):
        self.assertEqual(self.invoke("divide", 1, 0)["statusCode"], 400)


if __name__ == "__main__":
    unittest.main()
